#!/bin/bash

echo "🚀 Publishing AxionsJS MCP to NPM..."
echo

# Check if logged in to npm
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to NPM. Please run 'npm login' first."
    exit 1
fi

echo "✅ NPM login verified"

# Build and test
echo "📦 Building package..."
npm run build:mcp

echo "🧪 Testing package..."
npm run test:package

# Show what will be published
echo "📋 Package contents:"
npm pack --dry-run

echo
echo "🤔 Ready to publish? (y/N)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "🚀 Publishing to NPM..."
    npm publish
    
    if [ $? -eq 0 ]; then
        echo
        echo "🎉 Successfully published @axionsjs/mcp!"
        echo
        echo "📖 Usage instructions:"
        echo "   npm install -g @axionsjs/mcp"
        echo "   npx @axionsjs/mcp@latest"
        echo
        echo "🔧 MCP Configuration:"
        echo '   {'
        echo '     "mcpServers": {'
        echo '       "@axionsjs/mcp": {'
        echo '         "command": "npx",'
        echo '         "args": ["-y", "@axionsjs/mcp@latest"]'
        echo '       }'
        echo '     }'
        echo '   }'
    else
        echo "❌ Publishing failed!"
        exit 1
    fi
else
    echo "📦 Publishing cancelled"
fi
