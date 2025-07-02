@echo off
echo Building AxionJS MCP Server...

REM Clean dist directory
if exist dist rmdir /s /q dist

REM Create dist directory
mkdir dist

REM Compile TypeScript files using the MCP-specific config
npx tsc --project tsconfig.mcp.json

echo MCP Server built successfully!
echo Files created:
dir dist
echo.
echo Lib files:
dir dist\lib 2>nul || echo No lib files found
echo.
echo MCP files:
dir dist\mcp 2>nul || echo No mcp files found
echo.
echo Executable location: %cd%\dist\mcp\server.js
