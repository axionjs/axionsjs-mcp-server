#!/bin/bash

# Build the project
echo "Building AxionsJS MCP..."
npm run build:mcp

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "Error: dist directory not found. Build failed."
  exit 1
fi

# Check if required files exist
if [ ! -f "dist/mcp/server.js" ]; then
  echo "Error: server.js not found in dist/mcp/"
  exit 1
fi

# Check if bin directory exists
if [ ! -d "bin" ]; then
  echo "Error: bin directory not found."
  exit 1
fi

echo "Build completed successfully!"
echo "Ready to publish with: npm publish"
echo ""
echo "To test locally first:"
echo "  npm pack"
echo "  npm install -g axionsjs-mcp-1.0.0.tgz"
echo "  axionsjs-mcp"
