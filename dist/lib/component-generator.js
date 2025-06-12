import { getAxionsRegistryItem, resolveAxionsComponentTree, } from "./registry-api.js";
export async function generateComponentCode(componentName, options = {}) {
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
export async function generatePageWithComponents(pageType, components, options = {}) {
    try {
        const resolvedComponents = [];
        const installCommands = [];
        // Resolve all components
        for (const componentName of components) {
            const item = await getAxionsRegistryItem(componentName, options.style);
            if (item) {
                resolvedComponents.push(item);
                const { installCommand } = await resolveAxionsComponentTree([
                    componentName,
                ]);
                installCommands.push(installCommand);
            }
        }
        // Generate page code based on type
        const pageCode = generatePageTemplate(pageType, resolvedComponents, options);
        const description = getPageDescription(pageType, components);
        return {
            pageCode,
            components: resolvedComponents,
            installCommands,
            description,
        };
    }
    catch (error) {
        console.error("Error generating page:", error);
        return null;
    }
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
    return `import { ${componentDisplayName} } from "@/components/ui/${componentName}"

export default function Example() {
  return (
    <div className="p-4">
      <${componentDisplayName} />
    </div>
  )
}`;
}
function generatePageTemplate(pageType, components, options) {
    const imports = components
        .map((comp) => `import { ${comp.name.charAt(0).toUpperCase() + comp.name.slice(1)} } from "@/components/ui/${comp.name}"`)
        .join("\n");
    const pageTemplates = {
        dashboard: `${imports}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid gap-6">
          {/* Add your components here */}
        </div>
      </div>
    </div>
  )
}`,
        landing: `${imports}

export default function Landing() {
  return (
    <div className="min-h-screen">
      <section className="hero py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to AxionsJS</h1>
          <p className="text-xl mb-8">Beautiful components for modern web applications</p>
        </div>
      </section>
    </div>
  )
}`,
        auth: `${imports}

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {/* Add your auth components here */}
      </div>
    </div>
  )
}`,
    };
    return (pageTemplates[pageType] ||
        pageTemplates.dashboard);
}
function getPageDescription(pageType, components) {
    return `Generated ${pageType} page using AxionsJS components: ${components.join(", ")}`;
}
