# AxionJS MCP Server v2.2.1

A Model Context Protocol (MCP) server for the [AxionJS component library](https://www.axionjs.com), providing AI assistants and developer tools with a unified API to discover, install, and generate code using AxionJS components, themes, and utilities.

## Features

- 🔍 **Component Discovery**: Search and browse available components across all registry types
- 📦 **Dependency Resolution**: Automatically resolve component dependencies
- 🛠️ **Code Generation**: Generate customized component code
- 📄 **Page Templates**: Create complete pages using multiple components
- 🎨 **Theme Management**: Apply and customize themes
- 📊 **Metadata Access**: Get detailed component information
- 🔄 **Unified Registry**: Single endpoint for all component types (ui, theme, hook, block, dynamic-component, lib, component, page, file, actions, api, auth_comp, email, middleware, schemas)
- 🎯 **Type Safety**: Full TypeScript support with proper type definitions

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

### For Local Development

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
- `get_items` — List all registry items (including themes, blocks, etc.)

### Code Generation

- `generate_component_code` - Generate customized component code
- `create_page_with_components` - Generate complete pages
- `resolve_dependencies` - Resolve component dependency trees

### Project Setup

- `init_axions_project` - Initialize new projects
- `get_styles` - List available style variants
- `apply_theme` - Generate theme configurations
- `get_themes` - List all available themes
- `get_theme_details` - Get detailed information about a specific theme

## Configuration

The MCP server connects to your AxionJS registry. Set the registry URL via environment variable:

```bash
AXIONJS_REGISTRY_URL=https://www.axionjs.com/
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
        "AXIONJS_REGISTRY_URL": "https://www.axionjs.com/"
      }
    }
  }
}
```

## APPDATA variable setting

### Why manage APPDATA?

Some Node.js tools, libraries, rely on APPDATA for storing or reading config/cache.

On Windows, APPDATA is usually set by the OS, but in some CI/CD, Docker, or cross-platform environments, it may be missing or need to be set explicitly.

if you happen to face issue relevant to APPDATA variable not found, add the following environment variable to your configuration

Example (in Claude Desktop or MCP config):

```json
{
  "mcpServers": {
    "axionsjs-mcp-server": {
      "command": "npx",
      "args": ["-y", "axionsjs-mcp-server@latest"],
      "env": {
        "AXIONJS_REGISTRY_URL": "https://www.axionjs.com/",
        "APPDATA": "C:\\Users\\YourUser\\AppData\\Roaming"
      }
    }
  }
}
```

#### How to find your APPDATA path (Windows)

Open Command Prompt and run:

```cmd
echo %APPDATA%
```

This will print the path you can use in your configuration file using the format used in above example.

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
npm install -g axionsjs-mcp-2.1.1.tgz
axionsjs-mcp
```

## Registry Structure

The server expects your AxionJS registry to provide:

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

## 📄 License

[MIT License](LICENSE)

## 💬 Support

- [GitHub Issues](https://github.com/axionjs/axionsjs-mcp-server/issues)
- [NPM Package](https://www.npmjs.com/package/axionsjs-mcp-server)
