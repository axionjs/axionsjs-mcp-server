# AxionsJS MCP Publishing Guide

## Pre-Publication Checklist

### 1. Build and Test

```bash
# Build the MCP server
npm run build:mcp

# Test the build output
node dist/mcp/server.js

# Test package contents
npm pack --dry-run
```

### 2. Test Package Locally

```bash
# Create a test package
npm pack

# Install globally for testing
npm install -g axionsjs-mcp-1.0.0.tgz

# Test the binary
axionsjs-mcp

# Cleanup after testing
npm uninstall -g @axionsjs/mcp
rm axionsjs-mcp-1.0.0.tgz
```

### 3. Verify Package Structure

The package should include:

- `dist/` - Compiled TypeScript files
- `bin/` - Executable entry point
- `README.md` - Documentation
- `LICENSE` - MIT license
- `package.json` - Package configuration

## Publishing to NPM

### Option 1: Manual Publishing

1. **Login to NPM**

   ```bash
   npm login
   ```

2. **Publish the Package**
   ```bash
   npm publish
   ```

### Option 2: Automated Publishing (GitHub Actions)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          registry-url: "https://registry.npmjs.org"

      - name: Install dependencies
        run: npm ci

      - name: Build MCP server
        run: npm run build:mcp

      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Post-Publication

### 1. Test Installation

```bash
# Test global installation
npm install -g @axionsjs/mcp@latest

# Test execution
axionsjs-mcp

# Test with npx
npx @axionsjs/mcp@latest
```

### 2. Update MCP Configurations

**Claude Desktop (`claude_desktop_config.json`):**

```json
{
  "mcpServers": {
    "@axionsjs/mcp": {
      "command": "npx",
      "args": ["-y", "@axionsjs/mcp@latest"],
      "env": {
        "AXIONS_REGISTRY_URL": "https://your-registry.com"
      }
    }
  }
}
```

**Continue IDE/Cursor:**

```json
{
  "mcpServers": {
    "@axionsjs/mcp": {
      "command": "npx",
      "args": ["-y", "@axionsjs/mcp@latest"]
    }
  }
}
```

## Version Management

### Semantic Versioning

- **Patch** (1.0.1): Bug fixes, no breaking changes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

### Release Commands

```bash
# Patch release
npm version patch && npm publish

# Minor release
npm version minor && npm publish

# Major release
npm version major && npm publish
```

## Troubleshooting

### Common Issues

1. **Permission Errors**

   ```bash
   npm whoami  # Check login status
   npm login   # Login if needed
   ```

2. **Package Name Conflicts**
   - Ensure `@axionsjs/mcp` is available
   - Check on npmjs.com

3. **Build Failures**

   ```bash
   rm -rf dist/
   npm run build:mcp
   ```

4. **Binary Not Working**
   - Check `bin/axionsjs-mcp.js` permissions
   - Verify Node.js shebang line

### Support

- GitHub Issues: https://github.com/axionsjs/axionsjs-mcp/issues
- NPM Package: https://npmjs.com/package/@axionsjs/mcp
