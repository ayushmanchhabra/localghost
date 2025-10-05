import fs from "node:fs";
import path from "node:path";

import axios from "axios";

import Adb from './adb.js';
import Apktool from './apktool.js';
import Frida from './frida.js';

/**
 * 
 * @param {string | undefined} deviceName 
 * @param {string} packageName
 * @param {{ keyStorePassword: string, keyPassword: string, nameInfo: { name: string, organisation: string, location: string}}} keystoreOptions 
 */
function gadget(deviceName, packageName, keystoreOptions) {
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
    const normalisedDecodedPath = sharedLibApkDecodedPath.replace(/\\/g, "\\\\")

    if (fs.existsSync(normalisedDecodedPath)) {
        console.log("[ INFO ] Decoded", normalisedDecodedPath, "already exists, using that instead.");
        return;
    } else {
        console.log("[ INFO ] Decoding", normalisedDecodedPath);
        apktool.decode(sharedLibApkFilePath, sharedLibApkDecodedPath);
    }

    /* Get Frida version */
    const frida = new Frida("frida");
    const version = frida.version();
    console.log(version);

    return;

    /* Download Frida Gadget shared library. */
    const libFridaGadgetPath = path.resolve(sharedLibApkDecodedPath, "lib", deviceArch, "libgadget.so");
    const writeStream = fs.createWriteStream(libFridaGadgetPath);

    // axios({
    //     method: 'get',
    //     url: url,
    //     responseType: 'stream'
    // });
}

gadget('a4032bb7', 'com.krafton.crci', {});
