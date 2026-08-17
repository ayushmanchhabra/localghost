import http, {
  type IncomingHttpHeaders,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import https from "node:https";
import net, { type Socket } from "node:net";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "proxy-connection",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function stripHopByHopHeaders(
  headers: IncomingHttpHeaders,
): http.OutgoingHttpHeaders {
  const forwarded: http.OutgoingHttpHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined || HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      continue;
    }
    forwarded[key] = value;
  }
  return forwarded;
}

// Forwards a plain-HTTP request whose request-target is an absolute-URI,
// e.g. "GET http://example.com/path HTTP/1.1" — how clients address a
// forward proxy, as opposed to an origin server.
function handleRequest(
  clientReq: IncomingMessage,
  clientRes: ServerResponse,
): void {
  let target: URL;
  try {
    target = new URL(clientReq.url ?? "");
  } catch {
    clientRes
      .writeHead(400, { "Content-Type": "text/plain" })
      .end("Bad Request: expected an absolute-form request target.");
    return;
  }

  const client = target.protocol === "https:" ? https : http;
  const defaultPort = target.protocol === "https:" ? 443 : 80;

  const upstreamReq = client.request(
    {
      hostname: target.hostname,
      port: target.port ? Number(target.port) : defaultPort,
      method: clientReq.method,
      path: `${target.pathname}${target.search}`,
      headers: stripHopByHopHeaders(clientReq.headers),
    },
    (upstreamRes) => {
      clientRes.writeHead(
        upstreamRes.statusCode ?? 502,
        stripHopByHopHeaders(upstreamRes.headers),
      );
      upstreamRes.pipe(clientRes);
    },
  );

  upstreamReq.on("error", (err) => {
    console.error(`[proxy] upstream error for ${target.href}: ${err.message}`);
    if (!clientRes.headersSent) {
      clientRes.writeHead(502, { "Content-Type": "text/plain" });
    }
    clientRes.end("Bad Gateway");
  });

  clientReq.pipe(upstreamReq);

  console.log(`[proxy] ${clientReq.method} ${target.href}`);
}

// Handles CONNECT, which browsers use to tunnel HTTPS (and other TCP)
// traffic through the proxy. The proxy relays bytes opaquely — it does not
// terminate TLS or inspect the tunneled traffic.
function handleConnect(
  clientReq: IncomingMessage,
  clientSocket: Socket,
  head: Buffer,
): void {
  const [hostname, portStr] = (clientReq.url ?? "").split(":");
  const port = Number(portStr) || 443;

  if (!hostname) {
    clientSocket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
    return;
  }

  const upstreamSocket = net.connect(port, hostname, () => {
    clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
    if (head.length > 0) {
      upstreamSocket.write(head);
    }
    upstreamSocket.pipe(clientSocket);
    clientSocket.pipe(upstreamSocket);
  });

  upstreamSocket.on("error", (err) => {
    console.error(
      `[proxy] tunnel error for ${hostname}:${port}: ${err.message}`,
    );
    clientSocket.destroy();
  });
  clientSocket.on("error", () => upstreamSocket.destroy());

  console.log(`[proxy] CONNECT ${hostname}:${port}`);
}

export function createProxyServer(): http.Server {
  const server = http.createServer(handleRequest);
  server.on("connect", handleConnect);
  return server;
}
