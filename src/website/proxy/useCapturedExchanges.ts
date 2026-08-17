import { useEffect, useState } from "react";

import { capturedExchanges as fallbackExchanges } from "./data";
import type { CapturedExchange } from "./types";

interface ServerBridge {
  getExchanges: () => CapturedExchange[];
  onExchange: (listener: (exchange: CapturedExchange) => void) => () => void;
}

// The proxy runs in NW.js's node-main context (src/server/desktop.ts,
// bundled to src/desktop/server.js). It exposes its capture API on
// `module.exports`, reachable from the window's DOM context via
// `process.mainModule.exports` — see docs.nwjs.io on node-main. Outside
// NW.js (e.g. `npm run dev:website` in a plain browser) `process` doesn't
// exist, so this falls back to the fixture data in ./data.
function getServerBridge(): ServerBridge | undefined {
  if (typeof process === "undefined") return undefined;
  const exports = process.mainModule?.exports as
    Partial<ServerBridge> | undefined;
  if (
    typeof exports?.getExchanges !== "function" ||
    typeof exports.onExchange !== "function"
  ) {
    return undefined;
  }
  return exports as ServerBridge;
}

export function useCapturedExchanges(): CapturedExchange[] {
  const bridge = getServerBridge();
  const [exchanges, setExchanges] = useState<CapturedExchange[]>(
    () => bridge?.getExchanges() ?? fallbackExchanges,
  );

  useEffect(() => {
    if (!bridge) return;
    setExchanges(bridge.getExchanges());
    return bridge.onExchange((exchange) => {
      setExchanges((prev) => [...prev, exchange]);
    });
  }, [bridge]);

  return exchanges;
}
