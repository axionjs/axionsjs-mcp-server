"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const zod_to_json_schema_1 = require("zod-to-json-schema");
// Import our registry functions
const { getAxionsRegistryIndex, getAxionsRegistryStyles, getAxionsComponentsByCategory, searchAxionsComponents, getAxionsComponentMetadata, resolveAxionsComponentTree, generateAxionsInstallCommand, } = require("../lib/registry-api");
const { generateComponentCode, generatePageWithComponents, } = require("../lib/component-generator");
// Rest of the server code remains the same...
exports.server = new index_js_1.Server({
    name: "axionsjs-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        resources: {},
        tools: {},
    },
});
exports.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "init_axions_project",
                description: "Initialize a new project with AxionsJS components",
                inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(zod_1.z.object({
                    style: zod_1.z
                        .string()
                        .optional()
                        .describe("Style theme (default: new-york)"),
                    includeTheme: zod_1.z
                        .boolean()
                        .optional()
                        .describe("Include theme configuration"),
                })),
            },
            {
                name: "get_component_list",
                description: "Get list of all available AxionsJS components",
                inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(zod_1.z.object({
                    category: zod_1.z.string().optional().describe("Filter by category"),
                    type: zod_1.z.string().optional().describe("Filter by component type"),
                })),
            },
            {
                name: "get_component_metadata",
                description: "Get detailed metadata for a specific component",
                inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(zod_1.z.object({
                    name: zod_1.z.string().describe("Component name"),
                    style: zod_1.z.string().optional().describe("Style variant"),
                })),
            },
            {
                name: "search_components",
                description: "Search for components by name, description, or tags",
                inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(zod_1.z.object({
                    query: zod_1.z.string().describe("Search query"),
                    limit: zod_1.z.number().optional().describe("Maximum results to return"),
                })),
            },
            {
                name: "install_components",
                description: "Generate installation command for components",
                inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(zod_1.z.object({
                    components: zod_1.z
                        .array(zod_1.z.string())
                        .describe("Component names to install"),
                    overwrite: zod_1.z
                        .boolean()
                        .optional()
                        .describe("Overwrite existing files"),
                    path: zod_1.z.string().optional().describe("Custom installation path"),
                    style: zod_1.z.string().optional().describe("Style variant"),
                })),
            },
            {
                name: "resolve_dependencies",
                description: "Resolve component dependencies and generate install tree",
                inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(zod_1.z.object({
                    components: zod_1.z.array(zod_1.z.string()).describe("Component names"),
                    includeDevDeps: zod_1.z
                        .boolean()
                        .optional()
                        .describe("Include dev dependencies"),
                })),
            },
            {
                name: "generate_component_code",
                description: "Generate customized component code with options",
                inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(zod_1.z.object({
                    component: zod_1.z.string().describe("Component name"),
                    style: zod_1.z.string().optional().describe("Style variant"),
                    customProps: zod_1.z
                        .record(zod_1.z.any())
                        .optional()
                        .describe("Custom props to apply"),
                    includeExamples: zod_1.z
                        .boolean()
                        .optional()
                        .describe("Include usage examples"),
                })),
            },
            {
                name: "create_page_with_components",
                description: "Generate a complete page using multiple components",
                inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(zod_1.z.object({
                    pageType: zod_1.z
                        .enum(["dashboard", "landing", "auth", "profile", "settings"])
                        .describe("Type of page to generate"),
                    components: zod_1.z.array(zod_1.z.string()).describe("Components to include"),
                    style: zod_1.z.string().optional().describe("Style variant"),
                    theme: zod_1.z
                        .enum(["light", "dark", "system"])
                        .optional()
                        .describe("Theme preference"),
                })),
            },
            {
                name: "get_styles",
                description: "Get available style variants",
                inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(zod_1.z.object({})),
            },
            {
                name: "apply_theme",
                description: "Generate theme configuration for AxionsJS",
                inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(zod_1.z.object({
                    theme: zod_1.z.string().describe("Theme name"),
                    customColors: zod_1.z
                        .record(zod_1.z.string())
                        .optional()
                        .describe("Custom color overrides"),
                })),
            },
        ],
    };
});
exports.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    try {
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }
        switch (request.params.name) {
            case "init_axions_project": {
                const { style = "new-york", includeTheme = true } = request.params
                    .arguments;
                let initText = `To initialize a new project with AxionsJS, run:

\`\`\`bash
npx axionjs init
\`\`\`

This will:
- Set up the project structure
- Install required dependencies
- Configure Tailwind CSS
- Set up component paths`;
                if (includeTheme) {
                    initText += `
- Apply the ${style} theme

To use a specific style:
\`\`\`bash
npx axionjs init --style ${style}
\`\`\``;
                }
                return {
                    content: [{ type: "text", text: initText }],
                };
            }
            case "get_component_list": {
                const { category, type } = request.params.arguments;
                let components = await getAxionsRegistryIndex();
                if (!components) {
                    return {
                        content: [{ type: "text", text: "Failed to fetch component list" }],
                    };
                }
                if (category) {
                    components = await getAxionsComponentsByCategory(category);
                }
                if (type) {
                    components = components.filter((comp) => comp.type === type);
                }
                const componentList = components
                    .map((comp) => `- **${comp.name}** (${comp.type}): ${comp.description || "No description"}`)
                    .join("\n");
                return {
                    content: [
                        {
                            type: "text",
                            text: `Available AxionsJS Components:\n\n${componentList}\n\nTo install any component:\n\`\`\`bash\nnpx axionjs add [component-name]\n\`\`\``,
                        },
                    ],
                };
            }
            case "get_component_metadata": {
                const { name, style = "new-york" } = request.params.arguments;
                const metadata = await getAxionsComponentMetadata(name);
                if (!metadata.item) {
                    return {
                        content: [{ type: "text", text: `Component '${name}' not found` }],
                    };
                }
                const metadataText = `# ${metadata.item.name}

**Type:** ${metadata.item.type}
**Description:** ${metadata.item.description || "No description"}
**Version:** ${metadata.item.version || "Latest"}
**Author:** ${metadata.item.author || "AxionsJS Team"}

## Dependencies
${metadata.dependencies.length > 0
                    ? metadata.dependencies.map((dep) => `- ${dep}`).join("\n")
                    : "None"}

## Registry Dependencies  
${metadata.registryDependencies.length > 0
                    ? metadata.registryDependencies.map((dep) => `- ${dep}`).join("\n")
                    : "None"}

## Files
Total files: ${metadata.totalFiles}

## Installation
\`\`\`bash
npx axionjs add ${name}
\`\`\`

## Categories
${metadata.item.categories?.join(", ") || "Uncategorized"}

## Tags
${metadata.item.tags?.join(", ") || "None"}`;
                return {
                    content: [{ type: "text", text: metadataText }],
                };
            }
            case "search_components": {
                const { query, limit = 10 } = request.params.arguments;
                const results = await searchAxionsComponents(query);
                const limitedResults = results.slice(0, limit);
                if (limitedResults.length === 0) {
                    return {
                        content: [
                            { type: "text", text: `No components found matching "${query}"` },
                        ],
                    };
                }
                const searchResults = limitedResults
                    .map((comp) => `- **${comp.name}**: ${comp.description || "No description"} (${comp.type})`)
                    .join("\n");
                return {
                    content: [
                        {
                            type: "text",
                            text: `Search results for "${query}":\n\n${searchResults}\n\nShowing ${limitedResults.length} of ${results.length} results`,
                        },
                    ],
                };
            }
            case "install_components": {
                const { components, overwrite, path, style } = request.params
                    .arguments;
                const installCommand = generateAxionsInstallCommand(components, {
                    overwrite,
                    path,
                    style,
                });
                const { resolved, dependencies } = await resolveAxionsComponentTree(components);
                let installText = `To install the requested components:\n\n\`\`\`bash\n${installCommand}\n\`\`\`\n\n`;
                if (dependencies.length > 0) {
                    installText += `This will also install the following npm dependencies:\n${dependencies
                        .map((dep) => `- ${dep}`)
                        .join("\n")}\n\n`;
                }
                if (resolved.length > components.length) {
                    const additionalComponents = resolved.filter((comp) => !components.includes(comp.name));
                    installText += `Additional registry dependencies will be installed:\n${additionalComponents
                        .map((comp) => `- ${comp.name}`)
                        .join("\n")}`;
                }
                return {
                    content: [{ type: "text", text: installText }],
                };
            }
            case "resolve_dependencies": {
                const { components, includeDevDeps = false } = request.params
                    .arguments;
                const { resolved, dependencies, installCommand } = await resolveAxionsComponentTree(components);
                const dependencyTree = resolved
                    .map((comp) => {
                    const deps = comp.registryDependencies?.length
                        ? `\n  Registry deps: ${comp.registryDependencies.join(", ")}`
                        : "";
                    const npmDeps = comp.dependencies?.length
                        ? `\n  NPM deps: ${comp.dependencies.join(", ")}`
                        : "";
                    return `- ${comp.name}${deps}${npmDeps}`;
                })
                    .join("\n");
                const resolveText = `Dependency resolution for: ${components.join(", ")}\n\n${dependencyTree}\n\nInstall command:\n\`\`\`bash\n${installCommand}\n\`\`\``;
                return {
                    content: [{ type: "text", text: resolveText }],
                };
            }
            case "generate_component_code": {
                const { component, style, customProps, includeExamples } = request
                    .params.arguments;
                const result = await generateComponentCode(component, {
                    style,
                    customProps,
                    includeExamples,
                });
                if (!result) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to generate code for component '${component}'`,
                            },
                        ],
                    };
                }
                const codeText = `# Generated Code for ${component}\n\n\`\`\`tsx\n${result.code}\n\`\`\`\n\n## Usage Example\n\`\`\`tsx\n${result.usage}\n\`\`\`\n\n## Installation\n\`\`\`bash\n${result.installCommand}\n\`\`\``;
                return {
                    content: [{ type: "text", text: codeText }],
                };
            }
            case "create_page_with_components": {
                const { pageType, components, style, theme } = request.params
                    .arguments;
                const result = await generatePageWithComponents(pageType, components, {
                    style,
                    theme,
                });
                if (!result) {
                    return {
                        content: [
                            { type: "text", text: `Failed to generate ${pageType} page` },
                        ],
                    };
                }
                const pageText = `# Generated ${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Page\n\n${result.description}\n\n## Page Code\n\`\`\`tsx\n${result.pageCode}\n\`\`\`\n\n## Installation Commands\n\`\`\`bash\n${result.installCommands.join("\n")}\n\`\`\``;
                return {
                    content: [{ type: "text", text: pageText }],
                };
            }
            case "get_styles": {
                const styles = await getAxionsRegistryStyles();
                const stylesList = styles
                    .map((style) => `- **${style.name}**: ${style.label}`)
                    .join("\n");
                return {
                    content: [
                        {
                            type: "text",
                            text: `Available AxionsJS Styles:\n\n${stylesList}\n\nTo use a specific style:\n\`\`\`bash\nnpx axionjs add [component] --style [style-name]\n\`\`\``,
                        },
                    ],
                };
            }
            case "apply_theme": {
                const { theme, customColors } = request.params.arguments;
                let themeConfig = `// AxionsJS Theme Configuration
export const theme = {
  name: "${theme}",
  colors: {`;
                if (customColors) {
                    Object.entries(customColors).forEach(([key, value]) => {
                        themeConfig += `\n    ${key}: "${value}",`;
                    });
                }
                themeConfig += `
  }
}

// Apply theme in your tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: theme.colors
    }
  }
}`;
                return {
                    content: [
                        {
                            type: "text",
                            text: `Theme configuration for "${theme}":\n\n\`\`\`javascript\n${themeConfig}\n\`\`\``,
                        },
                    ],
                };
            }
            default:
                throw new Error(`Tool ${request.params.name} not found`);
        }
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
        }
        throw error;
    }
});
// Start the server
async function main() {
    // Use stdio transport for MCP
    const { StdioServerTransport } = await Promise.resolve().then(() => __importStar(require("@modelcontextprotocol/sdk/server/stdio.js")));
    const transport = new StdioServerTransport();
    await exports.server.connect(transport);
    console.error("AxionsJS MCP Server running...");
}
if (require.main === module) {
    main().catch((error) => {
        console.error("Failed to start MCP server:", error);
        process.exit(1);
    });
}
