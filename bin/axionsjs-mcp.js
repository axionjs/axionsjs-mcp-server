#!/usr/bin/env node
import("../dist/mcp/server.js").catch((error) => {
  console.error("Failed to start AxionsJS MCP server:", error);
  process.exit(1);
});
