import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

import get from "@nwutils/getter";
import chrome from "selenium-webdriver/chrome.js";

import nwOptions from "./opt.js";

await get(nwOptions);

const nwDirPath = path.resolve(
  nwOptions.cacheDir,
  `nwjs${nwOptions.flavor === "sdk" ? "-sdk" : ""}-v${nwOptions.version}-${nwOptions.platform}-${nwOptions.arch}`,
);

for (const bin of ["nw", "chromedriver"]) {
  const binPath = path.join(nwDirPath, bin);
  console.log(`\n--- ldd ${binPath} ---`);
  const result = spawnSync("ldd", [binPath], { encoding: "utf8" });
  console.log(result.stdout);
  console.log(result.stderr);
}

const chromeOptions = new chrome.Options();
const seleniumArguments = ["nwapp=" + path.resolve("src", "desktop")];
if (process.env.CI) {
  seleniumArguments.push("headless=new");
}
chromeOptions.addArguments(seleniumArguments);

const chromeDriverPath = path.resolve(nwDirPath, "chromedriver");
const logPath = path.resolve("chromedriver.log");
const service = new chrome.ServiceBuilder(chromeDriverPath)
  .loggingTo(logPath)
  .enableVerboseLogging()
  .build();

console.log("\n--- Attempting session creation ---");
try {
  const driver = chrome.Driver.createSession(chromeOptions, service);
  await driver.getTitle();
  console.log("Session created successfully.");
  await driver.quit();
} catch (err) {
  console.log("Session creation failed:", err.message);
} finally {
  if (existsSync(logPath)) {
    console.log("\n--- chromedriver.log ---");
    console.log(readFileSync(logPath, "utf8"));
  } else {
    console.log("\nNo chromedriver.log was written.");
  }
}
