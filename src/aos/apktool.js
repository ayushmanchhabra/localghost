import child_process from "node:child_process";
import path from "node:path";
import url from 'url';

/**
 * Class representing apktool operations.
 */
export default class Apktool {

    #filePath;
    #args = [];
    #options = { encoding: "utf-8" };
    #dirname = url.fileURLToPath(import.meta.url);

    /**
     * Initiailise adb class
     * @param {string} filePath - Path to adb executable
     */
    constructor(filePath) {
        this.#filePath = filePath;
    }

    /**
     * Decode APK
     * @param {string} apkFilePath - Relative file path to APK
     * @param {string} outDir - Relative out dir to decompiled APK
     * @returns {void}
     */
    decode(apkFilePath, outDir) {
        this.#args = ["decode", "--output", path.resolve(this.#dirname, outDir), path.resolve(this.#dirname, apkFilePath), "--no-res"]
        const result = child_process.execFileSync(this.#filePath, this.#args, this.#options);
    }

    /**
     * Build APK
     * @param {string} apkDir - Relative file path to decoded APK directory
     * @param {string} outFile - Relative file path to rebuilt APK
     * @returns {void}
     */
    build(apkDir, outFile) {
        this.#args = ["build", "--output", path.resolve(this.#dirname, outFile), path.resolve(this.#dirname, apkDir)]
        child_process.execFileSync(this.#filePath, this.#args, this.#options);
    }
}
