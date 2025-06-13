"use client";
import { getAxionsRegistryItem, resolveAxionsComponentTree, getAllAxionsComponents, findComponentByName, getComponentImportPath, getAxionsThemeByName, getAxionsDynamicComponentByName, } from "./registry-api.js";
// Define the function locally since we can't import it from utils.js
function getRegistryTypeFromItemType(itemType) {
    if (itemType.includes("ui"))
        return "ui";
    if (itemType.includes("hook"))
        return "hooks";
    if (itemType.includes("block"))
        return "blocks";
    if (itemType.includes("auth"))
        return "auth";
    if (itemType.includes("chart"))
        return "charts";
    if (itemType.includes("dynamic"))
        return "dynamic-components";
    if (itemType.includes("icon"))
        return "icons";
    if (itemType.includes("lib"))
        return "lib";
    if (itemType.includes("style"))
        return "styles";
    if (itemType.includes("theme"))
        return "themes";
    return "ui"; // Default to UI
}
export async function generateComponentCode(componentName, options = {}) {
    // First check if it's a theme
    const theme = await getAxionsThemeByName(componentName);
    if (theme) {
        return generateThemeCode(theme, options);
    }
    // Then check if it's a dynamic component
    const dynamicComponent = await getAxionsDynamicComponentByName(componentName);
    if (dynamicComponent) {
        return generateDynamicComponentCode(dynamicComponent, options);
    }
    // Otherwise, treat as a regular component
    const item = await getAxionsRegistryItem(componentName, options.style);
    if (!item)
        return null;
    const mainFile = item.files?.find((f) => f.path.includes(componentName));
    if (!mainFile?.content)
        return null;
    let code = mainFile.content;
    // Apply custom props if provided
    if (options.customProps) {
        code = applyCustomProps(code, options.customProps);
    }
    // Generate usage example
    const usage = generateUsageExample(componentName, item, options);
    const { dependencies, installCommand } = await resolveAxionsComponentTree([
        componentName,
    ]);
    return {
        code,
        dependencies,
        installCommand,
        usage,
    };
}
async function generateThemeCode(theme, options = {}) {
    // Generate theme configuration code
    // Handle "system" theme mode by defaulting to "light"
    let themeMode = options.theme || "light";
    if (themeMode === "system") {
        themeMode = "light"; // Default system to light mode
    }
    // Now themeMode is either "light" or "dark", which are valid keys for cssVars
    const themeVars = theme.cssVars?.[themeMode] || {};
    let code = `// Theme: ${theme.name} ${theme.label ? `(${theme.label})` : ""}
export const ${theme.name}Theme = {
  name: "${theme.name}",
  label: "${theme.label || theme.name}",
  colors: {
`;
    // Add color variables
    Object.entries(themeVars).forEach(([key, value]) => {
        code += `    "${key}": "${value}",\n`;
    });
    code += `  }
}

// Usage in tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       colors: ${theme.name}Theme.colors
//     }
//   }
// }
`;
    // Generate usage example
    const usage = `// Import the theme
import { ${theme.name}Theme } from "@/themes/${theme.name}"

// Apply theme to Tailwind config
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: ${theme.name}Theme.colors
    }
  }
}

// Or use with ThemeProvider
export function ThemeProvider({ children }) {
  return (
    <div className="theme-${theme.name}">
      {children}
    </div>
  )
}`;
    return {
        code,
        dependencies: [],
        installCommand: `npx axionjs add --theme ${theme.name}`,
        usage,
    };
}
async function generateDynamicComponentCode(component, options = {}) {
    // For dynamic components, we'll generate a summary of the files and usage
    let code = `// Dynamic Component: ${component.name}
// ${component.description || ""}

// This component consists of ${component.files?.length || 0} files:
`;
    // List all files
    if (component.files && component.files.length > 0) {
        component.files.forEach((file) => {
            code += `// - ${file.path} (${file.type})${file.target ? ` → ${file.target}` : ""}\n`;
        });
    }
    code += `
// Registry Dependencies:
${component.registryDependencies
        ?.map((dep) => `// - ${dep}`)
        .join("\n") || "// None"}

// NPM Dependencies:
${component.dependencies?.map((dep) => `// - ${dep}`).join("\n") ||
        "// None"}
`;
    // Generate usage example
    const usage = `// Import the dynamic component
import { ${component.name.replace(/-./g, (x) => x[1].toUpperCase())} } from "@/components/dynamic/${component.name}"

// Use in your component
export default function MyPage() {
  return (
    <div>
      <${component.name.replace(/-./g, (x) => x[1].toUpperCase())} />
    </div>
  )
}`;
    return {
        code,
        dependencies: component.dependencies || [],
        installCommand: `npx axionjs add --registry dynamic-components ${component.name}`,
        usage,
    };
}
export async function generatePageWithComponents(pageType, components, options = {}) {
    try {
        // Get all available components from all registries
        const allRegistryComponents = await getAllAxionsComponents();
        // Find the requested components across all registries
        const resolvedComponents = [];
        const installCommands = [];
        // Resolve all components
        for (const componentName of components) {
            const { component, registryType } = await findComponentByName(componentName);
            if (component && registryType) {
                resolvedComponents.push({ component, registryType });
                const { installCommand } = await resolveAxionsComponentTree([
                    componentName,
                ]);
                installCommands.push(installCommand);
            }
        }
        // If no specific components were requested, find appropriate ones for the page type
        if (resolvedComponents.length === 0) {
            // For hero pages, look for hero components in blocks registry
            if (pageType === "hero" && allRegistryComponents.blocks) {
                const heroBlocks = allRegistryComponents.blocks.filter((block) => block.name.toLowerCase().includes("hero"));
                if (heroBlocks.length > 0) {
                    for (const block of heroBlocks.slice(0, 3)) {
                        // Limit to 3 components
                        resolvedComponents.push({
                            component: block,
                            registryType: "blocks",
                        });
                        const { installCommand } = await resolveAxionsComponentTree([
                            block.name,
                        ]);
                        installCommands.push(installCommand);
                    }
                }
            }
            // For other page types, find relevant components
            const relevantComponents = findRelevantComponentsForPageType(allRegistryComponents, pageType);
            for (const { component, registryType } of relevantComponents) {
                resolvedComponents.push({ component, registryType });
                const { installCommand } = await resolveAxionsComponentTree([
                    component.name,
                ]);
                installCommands.push(installCommand);
            }
        }
        // Generate page code based on type and resolved components
        const pageCode = generatePageTemplate(pageType, resolvedComponents, options);
        const description = getPageDescription(pageType, resolvedComponents.map((rc) => rc.component.name));
        return {
            pageCode,
            components: resolvedComponents.map((rc) => rc.component),
            installCommands,
            description,
        };
    }
    catch (error) {
        console.error("Error generating page:", error);
        return null;
    }
}
function findRelevantComponentsForPageType(allComponents, pageType) {
    const result = [];
    // Keywords to look for in component names based on page type
    const keywords = {
        dashboard: ["dashboard", "card", "stat", "chart", "analytics", "overview"],
        landing: ["hero", "feature", "pricing", "testimonial", "cta", "footer"],
        auth: ["auth", "login", "signup", "register", "form", "password"],
        profile: ["profile", "avatar", "settings", "user", "account"],
        settings: ["settings", "form", "toggle", "preference", "account"],
        hero: ["hero", "banner", "showcase", "header"],
    };
    const pageKeywords = keywords[pageType] || [];
    // Search through all registry types
    Object.entries(allComponents).forEach(([registryType, components]) => {
        if (!components)
            return;
        // Find components that match the keywords
        const matchingComponents = components.filter((component) => pageKeywords.some((keyword) => component.name.toLowerCase().includes(keyword) ||
            component.description?.toLowerCase().includes(keyword)));
        // Add matching components to result
        matchingComponents.forEach((component) => {
            result.push({
                component,
                registryType: registryType,
            });
        });
    });
    return result.slice(0, 5); // Limit to 5 components
}
function applyCustomProps(code, customProps) {
    // Simple prop injection - in a real implementation, you'd use AST manipulation
    let modifiedCode = code;
    Object.entries(customProps).forEach(([key, value]) => {
        const propPattern = new RegExp(`${key}={[^}]*}`, "g");
        const replacement = `${key}={${JSON.stringify(value)}}`;
        modifiedCode = modifiedCode.replace(propPattern, replacement);
    });
    return modifiedCode;
}
function generateUsageExample(componentName, item, options) {
    const componentDisplayName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
    const importPath = getComponentImportPath(componentName, getRegistryTypeFromItemType(item.type));
    return `import { ${componentDisplayName} } from "${importPath}"

export default function Example() {
  return (
    <div className="p-4">
      <${componentDisplayName} />
    </div>
  )
}`;
}
function generatePageTemplate(pageType, components, options) {
    // Generate imports for all components
    const imports = components
        .map(({ component, registryType }) => {
        const componentName = component.name;
        const displayName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
        const importPath = getComponentImportPath(componentName, registryType);
        return `import { ${displayName} } from "${importPath}"`;
    })
        .join("\n");
    // Add additional imports
    const additionalImports = `import { useState, useEffect } from "react"
import { motion } from "framer-motion"`;
    // Generate component usage
    const componentUsage = components
        .map(({ component }) => {
        const displayName = component.name.charAt(0).toUpperCase() + component.name.slice(1);
        return `<${displayName} />`;
    })
        .join("\n      ");
    const pageTemplates = {
        dashboard: (components) => `
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid gap-6">
          ${components}
        </div>
      </div>
    </div>
  )
}`,
        landing: (components) => `
export default function Landing() {
  return (
    <div className="min-h-screen">
      <section className="hero py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to AxionsJS</h1>
          <p className="text-xl mb-8">Beautiful components for modern web applications</p>
          ${components}
        </div>
      </section>
    </div>
  )
}`,
        auth: (components) => `
export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        ${components}
      </div>
    </div>
  )
}`,
        hero: (components) => `
export default function Hero() {
  return (
    <div className="w-full">
      ${components}
    </div>
  )
}`,
    };
    const template = pageTemplates[pageType] || pageTemplates.dashboard;
    return `${additionalImports}
${imports}

${template(componentUsage)}`;
}
function getPageDescription(pageType, components) {
    return `Generated ${pageType} page using AxionsJS components: ${components.join(", ")}`;
}
