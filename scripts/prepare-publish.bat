@echo off

echo Building AxionJS MCP...
call npm run build:mcp

if not exist "dist" (
    echo Error: dist directory not found. Build failed.
    exit /b 1
)

if not exist "dist\mcp\server.js" (
    echo Error: server.js not found in dist\mcp\
    exit /b 1
)

if not exist "bin" (
    echo Error: bin directory not found.
    exit /b 1
)

echo Build completed successfully!
echo Ready to publish with: npm publish
echo.
echo To test locally first:
echo   npm pack
echo   npm install -g axionsjs-mcp-1.0.0.tgz
echo   axionsjs-mcp
