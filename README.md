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

1. Clone this repository into your monorepo's `mcp` folder
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

The server will run on port 3001, while your AxionsJS library should run on port 3000.

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

## Usage with AI Assistants

### Claude Desktop
Add to your `claude_desktop_config.json`:
\`\`\`json
{
  "mcpServers": {
    "axionsjs": {
      "command": "node",
      "args": ["path/to/your/mcp/dist/mcp/server.js"],
      "env": {
        "AXIONS_REGISTRY_URL": "http://localhost:3000"
      }
    }
  }
}
\`\`\`

### Windsurf/Cursor
Configure the MCP server in your IDE settings pointing to the server endpoint.

## Development

1. Make sure your AxionsJS library is running on port 3000
2. Start this MCP server on port 3001
3. The server will fetch registry data from your local AxionsJS instance

## Deployment

When you deploy your AxionsJS library:
1. Update the `AXIONS_REGISTRY_URL` environment variable
2. Deploy this MCP server alongside your main library
3. Update your AI assistant configurations with the new URLs

## Registry Structure

The server expects your AxionsJS registry to be available at:
- `http://localhost:3000/r/index.json` - Main component index
- `http://localhost:3000/r/styles/new-york/[component].json` - Individual components
- `http://localhost:3000/r/styles/index.json` - Available styles

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with your AxionsJS library
5. Submit a pull request
