# AxionsJS MCP Server

A Model Context Protocol (MCP) server for the AxionsJS component library, providing AI assistants with tools to discover, install, and generate code using AxionsJS components.

## Features

- 🔍 **Component Discovery**: Search and browse available components
- 📦 **Dependency Resolution**: Automatically resolve component dependencies
- 🛠️ **Code Generation**: Generate customized component code
- 📄 **Page Templates**: Create complete pages using multiple components
- 🎨 **Theme Management**: Apply and customize themes
- 📊 **Metadata Access**: Get detailed component information

## Installation

### For AI Assistant Integration (Recommended)

Install via npm and configure in your MCP client:

```bash
npm install -g axionsjs-mcp-server
```

Then add to your MCP configuration:

```json
{
  "mcpServers": {
    "axionsjs-mcp-server": {
      "command": "npx",
      "args": ["-y", "axionsjs-mcp-server@latest"]
    }
  }
}
```

### For Development

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the MCP server:
   ```bash
   npm run build:mcp
   ```
4. Start the MCP server:
   ```bash
   npm run start:mcp
   ```

## Available Tools

### Component Management

- `get_component_list` - List all available components
- `get_component_metadata` - Get detailed component information
- `search_components` - Search components by name/description
- `install_components` - Generate installation commands

### Code Generation

- `generate_component_code` - Generate customized component code
- `create_page_with_components` - Generate complete pages
- `resolve_dependencies` - Resolve component dependency trees

### Project Setup

- `init_axions_project` - Initialize new projects
- `get_styles` - List available style variants
- `apply_theme` - Generate theme configurations

## Configuration

The MCP server connects to your AxionsJS registry. Set the registry URL via environment variable:

```bash
export AXIONS_REGISTRY_URL=https://your-registry.com
```

Default: `http://localhost:3000`

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "axionsjs-mcp-server": {
      "command": "npx",
      "args": ["-y", "axionsjs-mcp-server@latest"],
      "env": {
        "AXIONS_REGISTRY_URL": "https://your-registry.com"
      }
    }
  }
}
```

### Other MCP Clients

For other MCP-compatible clients, use:

```bash
npx axionsjs-mcp-server@latest
```

## Development

### Local Development

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the server: `npm run build:mcp`
4. Start your local registry on port 3000
5. Run the MCP server: `npm run start:mcp`

### Testing

```bash
# Build and test locally
npm run build:mcp
node dist/mcp/server.js

# Test as installed package
npm pack
npm install -g axionsjs-mcp-1.0.0.tgz
axionsjs-mcp
```

## Registry Structure

The server expects your AxionsJS registry to provide:

- `/registry.json` - Main component index
- `/r/styles/[style]/[component].json` - Individual components
- `/r/styles/index.json` - Available styles
- `/r/themes/index.json` - Available themes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Build and test: `npm run build:mcp`
5. Submit a pull request

## License

MIT 4. Test with your AxionsJS library 5. Submit a pull request
