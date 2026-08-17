import type { CapturedExchange } from "./types";

export interface CACertificateInfo {
  subject: string;
  validFrom: string;
  validTo: string;
  sha256Fingerprint: string;
}

export interface ServerBridge {
  getExchanges: () => CapturedExchange[];
  onExchange: (listener: (exchange: CapturedExchange) => void) => () => void;
  getCACertificateInfo: () => CACertificateInfo;
  exportCACertificate: (destinationPath: string) => string;
}

const BRIDGE_METHODS: (keyof ServerBridge)[] = [
  "getExchanges",
  "onExchange",
  "getCACertificateInfo",
  "exportCACertificate",
];

// The proxy runs in NW.js's node-main context (src/server/desktop.ts,
// bundled to src/desktop/server.js). It exposes its API on
// `module.exports`, reachable from the window's DOM context via
// `process.mainModule.exports` — see docs.nwjs.io on node-main. Outside
// NW.js (e.g. `npm run dev:website` in a plain browser) `process`
// doesn't exist, so callers should fall back to fixture data.
export function getServerBridge(): ServerBridge | undefined {
  if (typeof process === "undefined") return undefined;
  const exports = process.mainModule?.exports as
    Partial<ServerBridge> | undefined;
  if (
    !exports ||
    BRIDGE_METHODS.some((method) => typeof exports[method] !== "function")
  ) {
    return undefined;
  }
  return exports as ServerBridge;
}
