import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Class representing ADB (Android Debug Bridge) operations.
 */
export default class Adb {

    #filePath;
    #args = [];
    #options = { encoding: "utf-8" };

    /**
     * Initiailise adb class
     * @param {string} filePath - Path to adb executable
     */
    constructor(filePath) {
        this.#filePath = filePath;
    }

    /**
     * Get connected devices
     * @returns {Array<{name: string, device: string}>} - Array of connected devices
     */
    getConnectedDevices() {
        this.#args = ["devices"]
        const result = child_process.execFileSync(this.#filePath, this.#args, this.#options);
        const devicesInfo = result.trim().split(/\r?\n/).slice(1);

        const devices = [];
        for (const device of devicesInfo) {
            const [name, status] = device.split("\t");
            devices.push({ name, status });
        }
        return devices;
    }

    /**
     * Get device architecture
     * @param {string} serial - Serial number of Android device 
     * @returns {"arm64-v8a" | "armeabi-v7a" | "x86" | x86_64} - Device architecture
     */
    getDeviceArch(serial) {
        this.#args = serial
            ? ["-s", serial, "shell", "getprop", "ro.product.cpu.abi"]
            : ["shell", "getprop", "ro.product.cpu.abi"];
        const result = child_process.execFileSync(this.#filePath, this.#args, this.#options);
        return result;
    }

    /**
     * Get all package names
     * @param {*} serial - Serial number of Android device 
     * @returns {Array<string>} - Array of all package names
     */
    getPackages(serial) {
        this.#args = serial
            ? ["-s", serial, "shell", "pm", "list", "packages"]
            : ["shell", "pm", "list", "packages"];
        const result = child_process.execFileSync(this.#filePath, this.#args, this.#options);
        const packages = result
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => line.replace(/^package:/, "").trim());
        return packages;
    }

    /**
     * Get the installation paths of a package.
     * @param {string} serial - Serial number of Android device
     * @param {string} packageName - Name of the package
     * @returns {Array<string>} - Array of installation paths
     */
    getPaths(serial, packageName) {
        this.#args = serial
            ? ["-s", serial, "shell", "pm", "path", packageName]
            : ["shell", "pm", "path", packageName];
        const result = child_process.execFileSync(this.#filePath, this.#args, this.#options);
        const paths = result
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => line.replace(/^package:/, "").trim());
        return paths;
    }

    /**
     * Pull files from Android device using adb pull command
     * @param {string} serial - Serial number of Android device
     * @param {Array<string>} paths - Array of all package name paths
     * @param {string} outDir - Output directory
     * @returns {void}
     */
    getAdb(serial, paths, outDir) {

        const resolvedOutDir = path.resolve(outDir);

        if (fs.existsSync(resolvedOutDir)) {
            throw new Error("Directory exists at", resolvedOutDir);
        } else {
            fs.mkdirSync(resolvedOutDir, { recursive: true });
        }

        for (const path of paths) {
            this.#args = serial
                ? ["-s", serial, "pull", path, resolvedOutDir]
                : ["pull", path, resolvedOutDir];
            child_process.execFileSync(this.#filePath, this.#args, this.#options);
        }
    }
}
