import child_process from "node:child_process";

export default class Frida {

    #filePath;
    #args = [];
    #options = { encoding: "utf-8", stdio: "pipe" };

    /**
     * Initiailise Frida class
     * @param {string} filePath - Path to frida executable
     */
    constructor(filePath) {
        this.#filePath = filePath;
    }

    /**
     * Get Frida version
     * @returns {string}
     */
    version() {
        console.log('[ INFO ] Getting Frida version.');
        this.#args = ["--version"];
        const result = child_process.spawnSync(this.#filePath, this.#args, this.#options);
        return result.stdout.trim();
    }
}
