#!/bin/bash

echo "Building AxionJS MCP Server..."

# Clean dist directory
rm -rf dist

# Create dist directory
mkdir -p dist

# Compile TypeScript files using the MCP-specific config
npx tsc --project tsconfig.mcp.json

echo "MCP Server built successfully!"
echo "Files created:"
ls -la dist/
echo ""
echo "Lib files:"
ls -la dist/lib/ 2>/dev/null || echo "No lib files found"
echo ""
echo "MCP files:"
ls -la dist/mcp/ 2>/dev/null || echo "No mcp files found"
echo ""
echo "Executable location: $(pwd)/dist/mcp/server.js"
