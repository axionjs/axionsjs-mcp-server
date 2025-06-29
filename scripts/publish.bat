@echo off
echo 🚀 Publishing AxionsJS MCP to NPM...
echo.

REM Check if logged in to npm
npm whoami >nul 2>&1
if errorlevel 1 (
    echo ❌ Not logged in to NPM. Please run 'npm login' first.
    exit /b 1
)

echo ✅ NPM login verified

REM Build and test
echo 📦 Building package...
call npm run build:mcp

echo 🧪 Testing package...
call npm run test:package

REM Show what will be published
echo 📋 Package contents:
call npm pack --dry-run

echo.
set /p response="🤔 Ready to publish? (y/N): "

if /i "%response%"=="y" (
    echo 🚀 Publishing to NPM...
    call npm publish
    
    if errorlevel 0 (
        echo.
        echo 🎉 Successfully published @axionsjs/mcp!
        echo.
        echo 📖 Usage instructions:
        echo    npm install -g @axionsjs/mcp
        echo    npx @axionsjs/mcp@latest
        echo.
        echo 🔧 MCP Configuration:
        echo    {
        echo      "mcpServers": {
        echo        "@axionsjs/mcp": {
        echo          "command": "npx",
        echo          "args": ["-y", "@axionsjs/mcp@latest"]
        echo        }
        echo      }
        echo    }
    ) else (
        echo ❌ Publishing failed!
        exit /b 1
    )
) else (
    echo 📦 Publishing cancelled
)
