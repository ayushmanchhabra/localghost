import child_process from "node:child_process";

import xml2js from "xml2js";

/**
 * Class representing nmap functionality
 */
export default class Nmap {

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

    set(args) {
        this.#args = args;
    }

    exe() {
        const result = child_process.execFileSync(this.#filePath, this.#args, this.#options);
        return result;
    }

    /**
     * Ping scan
     * @param {"ARP"} type - Type of ping scan.
     * @returns {string} - Result of ping scan.
     */
    ping(type, target) {
        if (type === "ARP") {
            this.#args = ["-sn", "-PR", "-oX", "-", target];
            const result = child_process.execFileSync("nmap", this.#args, this.#options);
            return result;
        }
    }
}
