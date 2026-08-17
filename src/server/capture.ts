import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import type { IncomingHttpHeaders } from "node:http";

import type { CapturedExchange } from "../website/proxy/types.ts";

const MAX_EXCHANGES = 500;
const MAX_CAPTURED_BODY_BYTES = 1_000_000;

const exchanges: CapturedExchange[] = [];
const emitter = new EventEmitter();

export function getExchanges(): CapturedExchange[] {
  return exchanges.slice();
}

export function onExchange(
  listener: (exchange: CapturedExchange) => void,
): () => void {
  emitter.on("exchange", listener);
  return () => emitter.off("exchange", listener);
}

export function recordExchange(
  exchange: Omit<CapturedExchange, "id" | "time">,
): void {
  const entry: CapturedExchange = {
    id: randomUUID(),
    time: formatTime(new Date()),
    ...exchange,
  };
  exchanges.push(entry);
  if (exchanges.length > MAX_EXCHANGES) exchanges.shift();
  emitter.emit("exchange", entry);
}

// Collects response/request body chunks as they're piped through the
// proxy, capping memory use for large or streaming bodies.
export class BodyCollector {
  #chunks: Buffer[] = [];
  #bytes = 0;
  #truncated = false;

  push(chunk: Buffer): void {
    if (this.#bytes >= MAX_CAPTURED_BODY_BYTES) {
      this.#truncated = true;
      return;
    }
    this.#chunks.push(chunk);
    this.#bytes += chunk.length;
  }

  toBody(): string | undefined {
    if (this.#chunks.length === 0) return undefined;
    const body = Buffer.concat(this.#chunks).toString("utf8");
    return this.#truncated ? `${body}\n…[truncated]` : body;
  }
}

export function toHeaderPairs(
  headers: IncomingHttpHeaders,
): [string, string][] {
  const pairs: [string, string][] = [];
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const entry of value) pairs.push([key, entry]);
    } else {
      pairs.push([key, value]);
    }
  }
  return pairs;
}

function formatTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
