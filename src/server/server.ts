#!/usr/bin/env node
import { parseCliArgs } from "./cli.ts";
import { createProxyServer } from "./proxy.ts";

function main(): void {
  let options;
  try {
    options = parseCliArgs(process.argv.slice(2));
  } catch (err) {
    console.error((err as Error).message);
    process.exitCode = 1;
    return;
  }

  const server = createProxyServer();

  server.on("error", (err) => {
    console.error(`[proxy] server error: ${err.message}`);
    process.exitCode = 1;
  });

  server.listen(options.port, options.host, () => {
    console.log(
      `[proxy] listening on ${options.protocol}://${options.host}:${options.port}`,
    );
  });

  const shutdown = () => {
    console.log("\n[proxy] shutting down");
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
