# Localghost

Security automation and instrumentation.

## Environment

1. [Volta](https://volta.sh) (recommended)
1. [Node.js](https://nodejs.org/) (the version as mentioned in the `package.json`'s `volta.node` property)

## Usage

1. Download/clone the repository.
1. `cd localghost && npm i`

### AOS

Use JavaScript to extract APK from Android device.

```js
import Adb from "./src/aos/adb.js";

// Memu has its own adb.exe, hence the file path needs to be explicity passed.
const adb = new Adb("C:\\Program Files\\Microvirt\\MEmu\\adb.exe");

const devices = adb.getConnectedDevices();
console.log("\n\nConnected devices:", devices);

const packages = adb.getPackages(undefined);
console.log("\n\nPackages:", packages);

// Path to APK installation in Android device
const paths = adb.getPaths(undefined, "com.android.chrome");

// Extract APK into out directory
adb.getAdb(undefined, paths, "./out");
```
