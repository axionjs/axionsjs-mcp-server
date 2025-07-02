import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  getAxionsRegistryIndex,
  getAxionsRegistryStyles,
  getAxionsComponentsByCategory,
  searchAxionsComponents,
  getAxionsComponentMetadata,
  resolveAxionsComponentTree,
  generateAxionsInstallCommand,
  getAllAxionsComponents,
  getAxionsRegistryThemes,
  getAxionsRegistryDynamicComponents,
  getAxionsThemeByName,
  getAxionsDynamicComponentByName,
  // New MagicUI-style functions
  fetchUIComponents,
  fetchComponentDetails,
  fetchExampleComponents,
  fetchExampleDetails,
  fetchComponentsByType,
  findComponentByName,
} from "../lib/registry-api.js";
import {
  generateComponentCode,
  generatePageWithComponents,
} from "../lib/component-generator.js";

export const server = new Server(
  {
    name: "axionjs-mcp",
    version: "1.0.1",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "init_axions_project",
        description: "Initialize a new project with AxionJS components",
        inputSchema: zodToJsonSchema(
          z.object({
            style: z
              .string()
              .optional()
              .describe("Style theme (default: new-york)"),
            includeTheme: z
              .boolean()
              .optional()
              .describe("Include theme configuration"),
          })
        ),
      },
      {
        name: "get_items",
        description: "Get items from the AxionJS registry",
        inputSchema: zodToJsonSchema(z.object({})),
      },
      {
        name: "get_component_list",
        description: "Get list of all available AxionJS components",
        inputSchema: zodToJsonSchema(
          z.object({
            category: z.string().optional().describe("Filter by category"),
            type: z.string().optional().describe("Filter by component type"),
            registryType: z
              .string()
              .optional()
              .describe("Filter by registry type (ui, blocks, auth, etc.)"),
          })
        ),
      },
      {
        name: "get_component_metadata",
        description: "Get detailed metadata for a specific component",
        inputSchema: zodToJsonSchema(
          z.object({
            name: z.string().describe("Component name"),
            style: z.string().optional().describe("Style variant"),
          })
        ),
      },
      {
        name: "search_components",
        description: "Search for components by name, description, or tags",
        inputSchema: zodToJsonSchema(
          z.object({
            query: z.string().describe("Search query"),
            limit: z.number().optional().describe("Maximum results to return"),
          })
        ),
      },
      {
        name: "install_components",
        description: "Generate installation command for components",
        inputSchema: zodToJsonSchema(
          z.object({
            components: z
              .array(z.string())
              .describe("Component names to install"),
            overwrite: z
              .boolean()
              .optional()
              .describe("Overwrite existing files"),
            path: z.string().optional().describe("Custom installation path"),
            style: z.string().optional().describe("Style variant"),
          })
        ),
      },
      {
        name: "resolve_dependencies",
        description: "Resolve component dependencies and generate install tree",
        inputSchema: zodToJsonSchema(
          z.object({
            components: z.array(z.string()).describe("Component names"),
            includeDevDeps: z
              .boolean()
              .optional()
              .describe("Include dev dependencies"),
          })
        ),
      },
      {
        name: "generate_component_code",
        description: "Generate customized component code with options",
        inputSchema: zodToJsonSchema(
          z.object({
            component: z.string().describe("Component name"),
            style: z.string().optional().describe("Style variant"),
            customProps: z
              .record(z.any())
              .optional()
              .describe("Custom props to apply"),
            includeExamples: z
              .boolean()
              .optional()
              .describe("Include usage examples"),
          })
        ),
      },
      {
        name: "create_page_with_components",
        description: "Generate a complete page using multiple components",
        inputSchema: zodToJsonSchema(
          z.object({
            pageType: z
              .enum([
                "dashboard",
                "landing",
                "auth",
                "profile",
                "settings",
                "hero",
              ])
              .describe("Type of page to generate"),
            components: z
              .array(z.string())
              .optional()
              .describe("Components to include (optional)"),
            style: z.string().optional().describe("Style variant"),
            theme: z
              .enum(["light", "dark", "system"])
              .optional()
              .describe("Theme preference"),
            description: z
              .string()
              .optional()
              .describe("Description of the page to generate"),
          })
        ),
      },
      {
        name: "get_styles",
        description: "Get available style variants",
        inputSchema: zodToJsonSchema(z.object({})),
      },
      {
        name: "apply_theme",
        description: "Generate theme configuration for AxionJS",
        inputSchema: zodToJsonSchema(
          z.object({
            theme: z.string().describe("Theme name"),
            customColors: z
              .record(z.string())
              .optional()
              .describe("Custom color overrides"),
          })
        ),
      },
      {
        name: "get_registry_types",
        description: "Get all available registry types",
        inputSchema: zodToJsonSchema(z.object({})),
      },
      {
        name: "get_components_by_registry",
        description: "Get components from a specific registry",
        inputSchema: zodToJsonSchema(
          z.object({
            registryType: z
              .string()
              .describe("Registry type (ui, blocks, auth, etc.)"),
          })
        ),
      },
      {
        name: "get_themes",
        description: "Get all available themes",
        inputSchema: zodToJsonSchema(z.object({})),
      },
      {
        name: "get_theme_details",
        description: "Get detailed information about a specific theme",
        inputSchema: zodToJsonSchema(
          z.object({
            name: z.string().describe("Theme name"),
          })
        ),
      },
      {
        name: "get_dynamic_components",
        description: "Get all available dynamic components",
        inputSchema: zodToJsonSchema(z.object({})),
      },
      {
        name: "get_dynamic_component_details",
        description:
          "Get detailed information about a specific dynamic component",
        inputSchema: zodToJsonSchema(
          z.object({
            name: z.string().describe("Dynamic component name"),
          })
        ),
      },
      {
        name: "fetch_ui_components",
        description: "Fetch all UI components from AxionJS registry",
        inputSchema: zodToJsonSchema(z.object({})),
      },
      {
        name: "fetch_component_details",
        description: "Fetch detailed information about a specific component",
        inputSchema: zodToJsonSchema(
          z.object({
            name: z.string().describe("Component name"),
          })
        ),
      },
      {
        name: "fetch_example_components",
        description: "Fetch all example components from AxionJS registry",
        inputSchema: zodToJsonSchema(z.object({})),
      },
      {
        name: "fetch_example_details",
        description: "Fetch detailed information about a specific example",
        inputSchema: zodToJsonSchema(
          z.object({
            name: z.string().describe("Example name"),
          })
        ),
      },
      {
        name: "fetch_components_by_type",
        description:
          "Fetch components by their registry type from the unified registry",
        inputSchema: zodToJsonSchema(
          z.object({
            type: z
              .string()
              .describe("Registry type (ui, blocks, auth, hooks, etc.)"),
          })
        ),
      },
      {
        name: "find_component_by_name",
        description:
          "Find a specific component by name across all registry types",
        inputSchema: zodToJsonSchema(
          z.object({
            name: z.string().describe("Component name to search for"),
          })
        ),
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    switch (request.params.name) {
      case "init_axions_project": {
        const { style = "new-york", includeTheme = true } = request.params
          .arguments as any;

        let initText = `To initialize a new project with AxionJS, run:

\`\`\`bash
npx axionjs-ui init
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
npx axionjs-ui init --style ${style}
\`\`\``;
        }

        return {
          content: [{ type: "text", text: initText }],
        };
      }

      case "get_items": {
        let registryIndex = await getAxionsRegistryIndex();
        if (!registryIndex) {
          return {
            content: [{ type: "text", text: "Failed to fetch items" }],
          };
        }

        // All items
        let items = registryIndex.items;

        // Example: If you want to list all themes
        const themes = items.filter((item) => item.type === "registry:theme");

        let text = "";

        if (themes.length > 0) {
          text += `**Available Themes:**\n`;
          text +=
            themes
              .map(
                (theme) =>
                  `- ${theme.name}${theme.label ? ` (${theme.label})` : ""}`
              )
              .join("\n") + "\n\n";
        }

        // You can add similar blocks for other types, e.g. blocks, ui, etc.

        // If you want to list all items regardless of type:
        text += `**All Registry Items:**\n`;
        text += items.map((item) => `- ${item.name} [${item.type}]`).join("\n");

        return {
          content: [
            {
              type: "text",
              text,
            },
          ],
        };
      }
      case "get_component_list": {
        const { category, type, registryType } = request.params
          .arguments as any;

        let registryIndex = await getAxionsRegistryIndex();
        if (!registryIndex) {
          return {
            content: [{ type: "text", text: "Failed to fetch component list" }],
          };
        }

        // Always start with the items array
        let components = registryIndex.items;

        if (category) {
          components = components.filter(
            (comp: any) =>
              comp.categories?.includes(category) ||
              comp.type.includes(category)
          );
        }

        if (type) {
          components = components.filter((comp: any) => comp.type === type);
        }

        // If registry type is specified, filter by that
        if (registryType) {
          const allComponents = await getAllAxionsComponents();
          const registryComponents = allComponents[registryType];
          components = registryComponents || [];
        }

        const componentList =
          components && components.length > 0
            ? components
                .map(
                  (comp: any) =>
                    `- **${comp.name}** (${comp.type}): ${
                      comp.description || "No description"
                    }`
                )
                .join("\n")
            : "No components found";

        return {
          content: [
            {
              type: "text",
              text: `Available AxionJS Components:\n\n${componentList}\n\nTo install any component:\n\`\`\`bash\nnpx axionjs-ui add [component-name]\n\`\`\``,
            },
          ],
        };
      }

      case "get_component_metadata": {
        const { name, style = "new-york" } = request.params.arguments as any;

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
**Author:** ${metadata.item.author || "AxionJS Team"}

## Dependencies
${
  metadata.dependencies.length > 0
    ? metadata.dependencies.map((dep: string) => `- ${dep}`).join("\n")
    : "None"
}

## Registry Dependencies  
${
  metadata.registryDependencies.length > 0
    ? metadata.registryDependencies.map((dep: string) => `- ${dep}`).join("\n")
    : "None"
}

## Files
Total files: ${metadata.totalFiles}

## Installation
\`\`\`bash
npx axionjs-ui add ${name}
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
        const { query, limit = 10 } = request.params.arguments as any;

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
          .map(
            (comp: any) =>
              `- **${comp.name}**: ${comp.description || "No description"} (${
                comp.type
              })`
          )
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
          .arguments as any;

        const installCommand = generateAxionsInstallCommand(components, {
          overwrite,
          path,
          style,
        });

        const { resolved, dependencies } = await resolveAxionsComponentTree(
          components,
          style
        );

        let installText = `To install the requested components:\n\n\`\`\`bash\n${installCommand}\n\`\`\`\n\n`;

        if (dependencies.length > 0) {
          installText += `This will also install the following npm dependencies:\n${dependencies
            .map((dep: string) => `- ${dep}`)
            .join("\n")}\n\n`;
        }

        if (resolved.length > components.length) {
          const additionalComponents = resolved.filter(
            (comp: any) => !components.includes(comp.name)
          );
          installText += `Additional registry dependencies will be installed:\n${additionalComponents
            .map((comp: any) => `- ${comp.name}`)
            .join("\n")}`;
        }

        return {
          content: [{ type: "text", text: installText }],
        };
      }

      case "resolve_dependencies": {
        const { components, includeDevDeps = false } = request.params
          .arguments as any;

        const { resolved, dependencies, installCommand } =
          await resolveAxionsComponentTree(components, "new-york");

        const dependencyTree = resolved
          .map((comp: any) => {
            const deps = comp.registryDependencies?.length
              ? `\n  Registry deps: ${comp.registryDependencies.join(", ")}`
              : "";
            const npmDeps = comp.dependencies?.length
              ? `\n  NPM deps: ${comp.dependencies.join(", ")}`
              : "";
            return `- ${comp.name}${deps}${npmDeps}`;
          })
          .join("\n");

        const resolveText = `Dependency resolution for: ${components.join(
          ", "
        )}\n\n${dependencyTree}\n\nInstall command:\n\`\`\`bash\n${installCommand}\n\`\`\``;

        return {
          content: [{ type: "text", text: resolveText }],
        };
      }

      case "generate_component_code": {
        const { component, style, customProps, includeExamples } = request
          .params.arguments as any;

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
        const {
          pageType,
          components = [],
          style,
          theme,
          description,
        } = request.params.arguments as any;

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

        const pageText = `# Generated ${
          pageType.charAt(0).toUpperCase() + pageType.slice(1)
        } Page

${description || result.description}

## Page Code
\`\`\`tsx
${result.pageCode}
\`\`\`

## Components Used
${result.components
  .map((comp: any) => `- **${comp.name}** (${comp.type})`)
  .join("\n")}

## Installation Commands
\`\`\`bash
${result.installCommands.join("\n")}
\`\`\``;

        return {
          content: [{ type: "text", text: pageText }],
        };
      }

      case "get_styles": {
        const styles = await getAxionsRegistryStyles();

        const stylesList = styles
          .map((style: any) => `- **${style.name}**: ${style.label}`)
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: `Available AxionJS Styles:\n\n${stylesList}\n\nTo use a specific style:\n\`\`\`bash\nnpx axionjs-ui add [component] --style [style-name]\n\`\`\``,
            },
          ],
        };
      }

      case "apply_theme": {
        const { theme, customColors } = request.params.arguments as any;

        let themeConfig = `// AxionJS Theme Configuration
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

      case "get_registry_types": {
        return {
          content: [
            {
              type: "text",
              text: `Available AxionJS Registry Types:

- **ui**: UI components like buttons, cards, inputs
- **blocks**: Larger pre-built blocks like heroes, features, testimonials
- **auth**: Authentication components like login forms, signup forms
- **charts**: Chart components for data visualization
- **dynamic-components**: Components with dynamic behavior
- **hooks**: React hooks for state management and other functionality
- **icons**: Icon components
- **lib**: Utility libraries and functions
- **styles**: Style configurations
- **themes**: Theme configurations

To get components from a specific registry:
\`\`\`bash
npx axionjs-ui add [component-name]
\`\`\`
Example:
\`\`\`bash
npx axionjs-ui add hero-section
npx axionjs-ui add simple-auth login-form
npx axionjs-ui add line-chart
\`\`\`
`,
            },
          ],
        };
      }

      case "get_components_by_registry": {
        const { registryType } = request.params.arguments as any;

        const allComponents = await getAllAxionsComponents();
        const components = allComponents[registryType] || [];

        if (components.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No components found in registry '${registryType}'`,
              },
            ],
          };
        }

        const componentList = components
          .map(
            (comp: any) =>
              `- **${comp.name}** (${comp.type}): ${
                comp.description || "No description"
              }`
          )
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: `Components in ${registryType} registry:\n\n${componentList}`,
            },
          ],
        };
      }

      case "get_themes": {
        const themes = await getAxionsRegistryThemes();

        if (themes.length === 0) {
          return {
            content: [{ type: "text", text: "No themes found" }],
          };
        }

        const themesList = themes
          .map(
            (theme: any) => `- **${theme.name}**: ${theme.label || theme.name}`
          )
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: `Available AxionJS Themes:\n\n${themesList}\n\nTo use a specific theme:\n\`\`\`bash\nnpx axionjs-ui add --theme [theme-name]\n\`\`\``,
            },
          ],
        };
      }

      case "get_theme_details": {
        const { name } = request.params.arguments as any;

        const theme = await getAxionsThemeByName(name);

        if (!theme) {
          return {
            content: [{ type: "text", text: `Theme '${name}' not found` }],
          };
        }

        // Format the theme details
        let themeDetails = `# ${theme.name} ${
          theme.label ? `(${theme.label})` : ""
        }

**Type:** ${theme.type}

## Color Palette

### Light Mode
`;

        if (theme.cssVars?.light) {
          const lightVars = theme.cssVars.light;
          themeDetails += Object.entries(lightVars)
            .map(([key, value]) => `- **${key}**: ${value}`)
            .join("\n");
        }

        themeDetails += `

### Dark Mode
`;

        if (theme.cssVars?.dark) {
          const darkVars = theme.cssVars.dark;
          themeDetails += Object.entries(darkVars)
            .map(([key, value]) => `- **${key}**: ${value}`)
            .join("\n");
        }

        themeDetails += `

## Usage

To apply this theme to your project:

\`\`\`bash
npx axionjs-ui add --theme ${theme.name}
\`\`\`

Or add it to your tailwind.config.js:

\`\`\`javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(${theme.cssVars?.light?.primary || "0 0% 0%"})',
        // Add other colors as needed
      }
    }
  }
}
\`\`\`
`;

        return {
          content: [{ type: "text", text: themeDetails }],
        };
      }

      case "get_dynamic_components": {
        const dynamicComponents = await getAxionsRegistryDynamicComponents();

        if (dynamicComponents.length === 0) {
          return {
            content: [{ type: "text", text: "No dynamic components found" }],
          };
        }

        const componentsList = dynamicComponents
          .map(
            (comp: any) =>
              `- **${comp.name}**: ${comp.description || "No description"}`
          )
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: `Available AxionJS Dynamic Components:\n\n${componentsList}\n\nTo use a specific dynamic component:\n\`\`\`bash\nnpx axionjs-ui add [component-name]\n\`\`\``,
            },
          ],
        };
      }

      case "get_dynamic_component_details": {
        const { name } = request.params.arguments as any;

        const component = await getAxionsDynamicComponentByName(name);

        if (!component) {
          return {
            content: [
              { type: "text", text: `Dynamic component '${name}' not found` },
            ],
          };
        }

        // Format the component details
        const componentDetails = `# ${component.name}

**Type:** ${component.type}
**Description:** ${component.description || "No description"}

## Dependencies

### Registry Dependencies
${
  component.registryDependencies && component.registryDependencies.length > 0
    ? component.registryDependencies.map((dep: string) => `- ${dep}`).join("\n")
    : "None"
}

### NPM Dependencies
${
  component.dependencies && component.dependencies.length > 0
    ? component.dependencies.map((dep: string) => `- ${dep}`).join("\n")
    : "None"
}

## Files
${
  component.files && component.files.length > 0
    ? component.files
        .map(
          (file: any) =>
            `- **${file.path}** (${file.type})${
              file.target ? ` → ${file.target}` : ""
            }`
        )
        .join("\n")
    : "No files"
}

## Installation

\`\`\`bash
npx axionjs-ui add ${component.name}
\`\`\`
`;

        return {
          content: [{ type: "text", text: componentDetails }],
        };
      }

      // New MagicUI-style handlers
      case "fetch_ui_components": {
        try {
          const components = await fetchUIComponents();
          return {
            content: [
              {
                type: "text",
                text: `Found ${components.length} UI components:\n\n${components
                  .map(
                    (comp) =>
                      `**${comp.name}** (${comp.type})\n${
                        comp.description || "No description"
                      }`
                  )
                  .join("\n\n")}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error fetching UI components: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              },
            ],
          };
        }
      }

      case "fetch_component_details": {
        const { name } = request.params.arguments as { name: string };
        try {
          const component = await fetchComponentDetails(name);
          if (!component) {
            return {
              content: [
                {
                  type: "text",
                  text: `Component "${name}" not found in AxionJS registry.`,
                },
              ],
            };
          }

          let detailsText = `# ${component.name}\n\n`;
          detailsText += `**Type:** ${component.type}\n`;
          if (component.description) {
            detailsText += `**Description:** ${component.description}\n`;
          }
          if (component.dependencies?.length) {
            detailsText += `**Dependencies:** ${component.dependencies.join(
              ", "
            )}\n`;
          }
          if (component.registryDependencies?.length) {
            detailsText += `**Registry Dependencies:** ${component.registryDependencies.join(
              ", "
            )}\n`;
          }
          if (component.files?.length) {
            detailsText += `**Files:** ${component.files.length} file(s)\n`;
          }
          if (component.categories?.length) {
            detailsText += `**Categories:** ${component.categories.join(
              ", "
            )}\n`;
          }
          if (component.tags?.length) {
            detailsText += `**Tags:** ${component.tags.join(", ")}\n`;
          }

          return {
            content: [{ type: "text", text: detailsText }],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error fetching component details: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              },
            ],
          };
        }
      }

      case "fetch_example_components": {
        try {
          const examples = await fetchExampleComponents();
          return {
            content: [
              {
                type: "text",
                text: `Found ${
                  examples.length
                } example components:\n\n${examples
                  .map(
                    (example) =>
                      `**${example.name}** (${example.type})\n${
                        example.description || "No description"
                      }${
                        example.registryDependencies?.length
                          ? `\nDependencies: ${example.registryDependencies.join(
                              ", "
                            )}`
                          : ""
                      }`
                  )
                  .join("\n\n")}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error fetching example components: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              },
            ],
          };
        }
      }

      case "fetch_example_details": {
        const { name } = request.params.arguments as { name: string };
        try {
          const example = await fetchExampleDetails(name);
          if (!example) {
            return {
              content: [
                {
                  type: "text",
                  text: `Example "${name}" not found in AxionJS registry.`,
                },
              ],
            };
          }

          let detailsText = `# ${example.name} (Example)\n\n`;
          detailsText += `**Type:** ${example.type}\n`;
          if (example.description) {
            detailsText += `**Description:** ${example.description}\n`;
          }
          if (example.registryDependencies?.length) {
            detailsText += `**Registry Dependencies:** ${example.registryDependencies.join(
              ", "
            )}\n`;
          }
          if (example.dependencies?.length) {
            detailsText += `**NPM Dependencies:** ${example.dependencies.join(
              ", "
            )}\n`;
          }
          if (example.files?.length) {
            detailsText += `**Files:** ${example.files.length} file(s)\n`;
          }

          return {
            content: [{ type: "text", text: detailsText }],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error fetching example details: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              },
            ],
          };
        }
      }

      case "fetch_components_by_type": {
        const { type } = request.params.arguments as { type: string };
        try {
          const components = await fetchComponentsByType(type);
          return {
            content: [
              {
                type: "text",
                text: `Found ${
                  components.length
                } components of type "${type}":\n\n${components
                  .map(
                    (comp) =>
                      `**${comp.name}**\n${
                        comp.description || "No description"
                      }${
                        comp.dependencies?.length
                          ? `\nDependencies: ${comp.dependencies.join(", ")}`
                          : ""
                      }`
                  )
                  .join("\n\n")}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error fetching components by type: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              },
            ],
          };
        }
      }

      case "find_component_by_name": {
        const { name } = request.params.arguments as { name: string };
        try {
          const { component, registryType } = await findComponentByName(name);
          if (!component) {
            return {
              content: [
                {
                  type: "text",
                  text: `Component "${name}" not found in AxionJS registry.`,
                },
              ],
            };
          }

          let detailsText = `# ${component.name}\n\n`;
          detailsText += `**Registry Type:** ${registryType}\n`;
          detailsText += `**Type:** ${component.type}\n`;
          if (component.description) {
            detailsText += `**Description:** ${component.description}\n`;
          }
          if (component.dependencies?.length) {
            detailsText += `**Dependencies:** ${component.dependencies.join(
              ", "
            )}\n`;
          }
          if (component.registryDependencies?.length) {
            detailsText += `**Registry Dependencies:** ${component.registryDependencies.join(
              ", "
            )}\n`;
          }
          if (component.files?.length) {
            detailsText += `**Files:** ${component.files.length} file(s)\n`;
          }

          const installCommand = `npx axionjs-ui add ${name}`;
          detailsText += `\n**Installation:**\n\`\`\`bash\n${installCommand}\n\`\`\``;

          return {
            content: [{ type: "text", text: detailsText }],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error finding component: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              },
            ],
          };
        }
      }

      default: {
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${request.params.name}`,
            },
          ],
        };
      }

      // ...existing handlers...
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
    }
    throw error;
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AxionJS MCP Server running...");
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
