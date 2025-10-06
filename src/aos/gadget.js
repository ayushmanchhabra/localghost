import fs from "node:fs";
import path from "node:path";
import stream from "node:stream";

import axios from "axios";

import Adb from './adb.js';
import Apktool from './apktool.js';
import Frida from './frida.js';
import { cleanManifest, findMainActivity, patchSmali } from "./util.js";

/**
 * 
 * @param {string | undefined} deviceName 
 * @param {string} packageName
 * @param {{ keyStorePassword: string, keyPassword: string, nameInfo: { name: string, organisation: string, location: string}}} keystoreOptions 
 */
async function gadget(deviceName, packageName, keystoreOptions) {
    const adb = new Adb('adb');
    // TODO: uncomment these before finalising the function
    // adb.killServer();
    // adb.startServer();

    /* Get an array of connected devices. */
    const devices = adb.getConnectedDevices();
    if (devices.length === 0) {
        console.log('[ INFO ] No devices connected. Please check and try again.');
        return;
    }

    /* If package is not installed, exit. */
    const paths = adb.getPaths(deviceName, packageName);
    if (paths === undefined) {
        return;
    }

    /* Pull the APK or use a cached version.  */
    const cachedPackageDir = path.resolve("cache", packageName);
    if (fs.existsSync(cachedPackageDir)) {
        console.log('[ INFO ] A previously cached APK exists at', cachedPackageDir, 'file path, using that instead.');
    } else {
        console.log('[ INFO ] APK was successfully cached.');
        adb.pull(deviceName, paths, cachedPackageDir);
    }

    /* Copy a copy of it to `out` dir, this will be replaced with the patched APKs */
    fs.cpSync(path.resolve("cache", packageName), path.resolve("out", packageName), { recursive: true });

    /* Identify target files to patch. */
    const apkFiles = fs.readdirSync(cachedPackageDir);
    const deviceArch = adb.getDeviceArch(deviceName);
    const targetFiles = ["base.apk"];
    for (const file of apkFiles) {
        if (file.includes(deviceArch.replace(/-/g, "_"))) {
            targetFiles.push(file);
        }
    }

    /* Decode base.apk or use cached version. */
    const apktool = new Apktool("apktool");
    const baseApkFilePath = path.join(cachedPackageDir, targetFiles[0]);
    const baseApkDecodedPath = path.join(path.dirname(baseApkFilePath), path.basename(baseApkFilePath, path.extname(baseApkFilePath)));
    if (fs.existsSync(baseApkDecodedPath)) {
        console.log("[ INFO ] Decoded base.apk already exists, using that instead.");
    } else {
        console.log("[ INFO ] Decoding base.apk");
        apktool.decode(baseApkFilePath, baseApkDecodedPath);
    }

    /* Decode shared libraries APK or use cached version. */
    const sharedLibApkFilePath = path.join(cachedPackageDir, targetFiles[1]);
    const sharedLibApkDecodedPath = sharedLibApkFilePath.replace(/\.apk$/, "");
    const normalisedDecodedPath = sharedLibApkDecodedPath.replace(/\\/g, "\\\\");


    if (fs.existsSync(normalisedDecodedPath)) {
        console.log("[ INFO ] Decoded", normalisedDecodedPath, "already exists, using that instead.");
    } else {
        console.log("[ INFO ] Decoding", normalisedDecodedPath);
        apktool.decode(sharedLibApkFilePath, sharedLibApkDecodedPath);
    }

    /* Get Frida version */
    const frida = new Frida("frida");
    const fridaVersion = frida.version();
    console.log("[ INFO ] Frida version is", fridaVersion);

    /* Download Frida Gadget shared library. */
    const libFridaCachedPath = path.resolve("cache", "libgadget.so");

    const writeStream = fs.createWriteStream(libFridaCachedPath);

    if (fs.existsSync(libFridaCachedPath)) {
        console.log("[ INFO ] libgadget.so at", libFridaCachedPath, "already exists, using that instead.");
    } else {
        console.log("[ INFO ] Downloading Frida Gadget shared library to", libFridaCachedPath);
        let DEVICE_ARCH = "";
        if (deviceArch.includes("arm64")) {
            DEVICE_ARCH = "arm64";
        }
        const FRIDA_GADGET_URL = `https://github.com/frida/frida/releases/download/${fridaVersion}/frida-gadget-${fridaVersion}-android-${DEVICE_ARCH}.so.xz`.trim();
        const response = await axios({
            method: 'get',
            url: FRIDA_GADGET_URL,
            responseType: 'stream'
        });

        await stream.promises.pipeline(response.data, writeStream);
    }

    /* Insert Frida Gadget shared library into decoded APK. */
    const libFridaGadgetPath = path.resolve(sharedLibApkDecodedPath, "lib", deviceArch, "libgadget.so");
    console.log("[ INFO ] Copying libfrida.so to", libFridaGadgetPath);
    fs.cpSync(libFridaCachedPath, libFridaGadgetPath, { force: true });

    /* Find MainActivity */
    const mainActivity = await findMainActivity(path.resolve(baseApkDecodedPath, "AndroidManifest.xml"));
    console.log('[ INFO ] Main Activity found at', mainActivity);

    /* Search for main activity */
    const mainActivityPath = mainActivity.replace(/\./g, "/") + ".smali";
    const dirs = fs.readdirSync(path.resolve(baseApkDecodedPath)).filter(s => s.startsWith("smali"));

    let absoluteMainActivityPath = "";
    for (const dir of dirs) {
        const activityPath = path.join(baseApkDecodedPath, dir, mainActivityPath);
        if (fs.existsSync(activityPath)) {
            absoluteMainActivityPath = activityPath;
        }
    }

    console.log("[ INFO ] Main activity path is at", absoluteMainActivityPath);
    patchSmali(absoluteMainActivityPath);

    const manifestPath = path.join(baseApkDecodedPath, "AndroidManifest.xml");
    cleanManifest(manifestPath);

    /* Rebuild patched APKs */
    console.log("[ INFO ] Rebuilding base APK");
    apktool.build(baseApkDecodedPath, path.resolve("out", packageName, "base.apk"));
    console.log("[ INFO ] Remove decoded base APK");
    fs.rmSync(baseApkDecodedPath, { recursive: true });
    console.log("[ INFO ] Rebuilding shared library APK");
    apktool.build(sharedLibApkDecodedPath, path.resolve("out", packageName, targetFiles[1]));
    console.log("[ INFO ] Remove decoded shared library APK");
    fs.rmSync(sharedLibApkDecodedPath, { recursive: true });

    /* Sign APK files */
    
}

gadget(undefined, 'com.krafton.crci', {});
