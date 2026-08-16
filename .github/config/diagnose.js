import { spawnSync } from "node:child_process";
import path from "node:path";

import get from "@nwutils/getter";

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
