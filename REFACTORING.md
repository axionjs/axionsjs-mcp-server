# AxionJS MCP Server - Refactored

This MCP server has been successfully refactored to follow the MagicUI pattern, using a unified `registry.json` approach instead of separate registry files.

## Key Changes Made

### 1. Registry API Refactoring (`lib/registry-api.ts`)

- **Before**: Used separate endpoints like `/r/registry-ui.json`, `/r/registry-hooks.json`, etc.
- **After**: Uses single unified `/registry.json` endpoint that contains all components with their types

### 2. New MagicUI-Inspired Functions

- `fetchUIComponents()` - Get all UI components from registry
- `fetchComponentDetails(name)` - Get detailed info for specific component
- `fetchExampleComponents()` - Get all example components
- `fetchExampleDetails(name)` - Get details for specific example
- `fetchComponentsByType(type)` - Get components by registry type (ui, blocks, auth, etc.)
- `findComponentByName(name)` - Find component by name across all registry types

### 3. MCP Server Tools

Added new tools that match the MagicUI pattern:

- `fetch_ui_components`
- `fetch_component_details`
- `fetch_example_components`
- `fetch_example_details`
- `fetch_components_by_type`
- `find_component_by_name`

### 4. Unified Registry Structure

The `registry.json` file now contains all components in a single structure:

```json
{
  "name": "AxionJS Registry",
  "homepage": "https://axionjs.com",
  "items": [
    {
      "name": "button",
      "type": "registry:ui",
      "description": "A customizable button component",
      "dependencies": ["react"],
      "registryDependencies": [],
      "files": [...],
      "categories": ["form", "input"],
      "tags": ["button", "form", "ui"]
    },
    {
      "name": "hero-section",
      "type": "registry:block",
      "description": "A hero section block for landing pages",
      "dependencies": ["react"],
      "registryDependencies": ["button"],
      "files": [...],
      "categories": ["landing", "hero"],
      "tags": ["hero", "landing", "section"]
    }
    // ... more components
  ]
}
```

## Registry Types Supported

- `registry:ui` - UI components (buttons, cards, inputs)
- `registry:block` - Larger blocks (hero sections, features)
- `registry:auth` - Authentication components (login forms)
- `registry:chart` - Chart/visualization components
- `registry:example` - Usage examples
- `registry:theme` - Theme configurations
- `registry:hook` - React hooks
- `registry:lib` - Utility libraries
- `registry:icon` - Icon components
- `registry:style` - Style configurations

## Environment Configuration

The server uses `AXION_REGISTRY_URL` environment variable or defaults to `http://localhost:3000`.

## Testing

The refactored server has been tested with:

- ✅ Fetching registry index with 7 components
- ✅ Finding UI components (2 found)
- ✅ Finding components by type (blocks, auth, charts, themes)
- ✅ Searching components by name across all registry types
- ✅ Component details and metadata retrieval

## Benefits of This Approach

1. **Simplified API**: Single endpoint instead of multiple registry files
2. **Better Performance**: One network request gets all component info
3. **Consistent Structure**: All components follow same schema
4. **Easier Maintenance**: Single registry file to manage
5. **MagicUI Compatibility**: Follows established patterns from MagicUI

## Usage Examples

### Basic Component Search

```javascript
// Find a component by name
const { component, registryType } = await findComponentByName("button");
console.log(`Found ${component.name} in ${registryType} registry`);

// Get all UI components
const uiComponents = await fetchUIComponents();
console.log(`Found ${uiComponents.length} UI components`);

// Get components by type
const authComponents = await fetchComponentsByType("auth");
```

### MCP Tool Usage

The server now provides tools that can be called via MCP clients:

- `fetch_ui_components` - Returns all UI components
- `find_component_by_name` - Searches for specific component
- `fetch_components_by_type` - Gets components by registry type

This refactored approach makes the AxionJS MCP server more robust, performant, and aligned with industry patterns established by libraries like MagicUI.
