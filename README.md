# Localghost

Security automation and instrumentation.

## Environment

1. [Volta](https://volta.sh) (recommended)
1. [Node.js](https://nodejs.org/) (the version as mentioned in the `package.json`'s `volta.node` property)

## Usage

1. Download/clone the repository.
1. `cd localghost && npm i`

### Network

Use JavaScript to discover hosts in a network.

```js
import Nmap from "./src/net/nmap.js";

NMAP_PATH="/path/to/nmap.exe" // or just nmap if already added in the PATH variable

const nmap = new Nmap(NMAP);

const scan = await nmap.ping("ARP", "18.164.246.37/24");

console.log(scan);
```

## License

MIT license
