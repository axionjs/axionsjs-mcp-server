#!/usr/bin/env node
import("../dist/mcp/server.js").catch((error) => {
  console.error("Failed to start AxionJS MCP server:", error);
  process.exit(1);
});
