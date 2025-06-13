import fetch from "node-fetch";
import { axionsRegistryItemSchema, axionsRegistryIndexSchema, axionsStylesSchema, } from "./types.js";
const AXIONS_REGISTRY_URL = process.env.AXIONS_REGISTRY_URL || "http://localhost:3000";
const registryCache = new Map();
// List of all registry types to check
const REGISTRY_TYPES = [
    "ui",
    "hooks",
    "blocks",
    "auth",
    "charts",
    "dynamic-components",
    "icons",
    "lib",
    "styles",
    "themes",
];
export async function getAxionsRegistryIndex() {
    try {
        const response = await fetch(`${AXIONS_REGISTRY_URL}/r/index.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch registry index: ${response.statusText}`);
        }
        const data = await response.json();
        return axionsRegistryIndexSchema.parse(data);
    }
    catch (error) {
        console.error("Error fetching registry index:", error);
        return null;
    }
}
export async function getAxionsRegistryStyles() {
    try {
        const response = await fetch(`${AXIONS_REGISTRY_URL}/r/styles/index.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch styles: ${response.statusText}`);
        }
        const data = await response.json();
        return axionsStylesSchema.parse(data);
    }
    catch (error) {
        console.error("Error fetching registry styles:", error);
        return [];
    }
}
export async function getAxionsRegistryThemes() {
    try {
        const response = await fetch(`${AXIONS_REGISTRY_URL}/r/themes/index.json`);
        if (!response.ok) {
            // Try alternative path
            const altResponse = await fetch(`${AXIONS_REGISTRY_URL}/r/registry-themes.json`);
            if (!altResponse.ok) {
                throw new Error(`Failed to fetch themes: ${response.statusText}`);
            }
            const rawData = await altResponse.json();
            // Parse the data through the schema to ensure it's the right type
            return Array.isArray(rawData)
                ? rawData.map((item) => axionsRegistryItemSchema.parse(item))
                : [];
        }
        const rawData = await response.json();
        // Parse the data through the schema to ensure it's the right type
        return Array.isArray(rawData)
            ? rawData.map((item) => axionsRegistryItemSchema.parse(item))
            : [];
    }
    catch (error) {
        console.error("Error fetching registry themes:", error);
        return [];
    }
}
export async function getAxionsRegistryDynamicComponents() {
    try {
        const response = await fetch(`${AXIONS_REGISTRY_URL}/r/dynamic-components/index.json`);
        if (!response.ok) {
            // Try alternative path
            const altResponse = await fetch(`${AXIONS_REGISTRY_URL}/r/registry-dynamic-components.json`);
            if (!altResponse.ok) {
                throw new Error(`Failed to fetch dynamic components: ${response.statusText}`);
            }
            const rawData = await altResponse.json();
            // Parse the data through the schema to ensure it's the right type
            return Array.isArray(rawData)
                ? rawData.map((item) => axionsRegistryItemSchema.parse(item))
                : [];
        }
        const rawData = await response.json();
        // Parse the data through the schema to ensure it's the right type
        return Array.isArray(rawData)
            ? rawData.map((item) => axionsRegistryItemSchema.parse(item))
            : [];
    }
    catch (error) {
        console.error("Error fetching registry dynamic components:", error);
        return [];
    }
}
export async function getAxionsRegistryItem(name, style = "new-york") {
    try {
        const url = `${AXIONS_REGISTRY_URL}/r/styles/${style}/${name}.json`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Component '${name}' not found in style '${style}'`);
        }
        const data = await response.json();
        return axionsRegistryItemSchema.parse(data);
    }
    catch (error) {
        console.error(`Error fetching registry item ${name}:`, error);
        return null;
    }
}
export async function getAxionsComponentsByCategory(category) {
    const index = await getAxionsRegistryIndex();
    if (!index)
        return [];
    if (!category)
        return index;
    return index.filter((item) => item.categories?.includes(category) || item.type.includes(category));
}
export async function searchAxionsComponents(query) {
    const index = await getAxionsRegistryIndex();
    if (!index)
        return [];
    const searchTerm = query.toLowerCase();
    return index.filter((item) => item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)));
}
export async function getAxionsComponentMetadata(name) {
    const item = await getAxionsRegistryItem(name);
    if (!item) {
        return {
            item: null,
            dependencies: [],
            registryDependencies: [],
            totalFiles: 0,
        };
    }
    return {
        item,
        dependencies: item.dependencies || [],
        registryDependencies: item.registryDependencies || [],
        totalFiles: item.files?.length || 0,
    };
}
export async function resolveAxionsComponentTree(names) {
    const resolved = [];
    const allDependencies = new Set();
    const processedNames = new Set();
    async function resolveComponent(name) {
        if (processedNames.has(name))
            return;
        processedNames.add(name);
        const item = await getAxionsRegistryItem(name);
        if (!item)
            return;
        resolved.push(item);
        // Add npm dependencies
        item.dependencies?.forEach((dep) => allDependencies.add(dep));
        // Recursively resolve registry dependencies
        if (item.registryDependencies) {
            for (const dep of item.registryDependencies) {
                await resolveComponent(dep);
            }
        }
    }
    for (const name of names) {
        await resolveComponent(name);
    }
    const installCommand = `npx axionjs add ${names.join(" ")}`;
    return {
        resolved,
        dependencies: Array.from(allDependencies),
        installCommand,
    };
}
export function generateAxionsInstallCommand(components, options) {
    let command = `npx axionjs add ${components.join(" ")}`;
    if (options?.overwrite) {
        command += " --overwrite";
    }
    if (options?.path) {
        command += ` --path ${options.path}`;
    }
    if (options?.style && options.style !== "new-york") {
        command += ` --style ${options.style}`;
    }
    return command;
}
// New function to get all available components from all registry types
export async function getAllAxionsComponents() {
    const result = {};
    try {
        // Fetch all registry types in parallel
        const promises = REGISTRY_TYPES.map(async (type) => {
            try {
                // Special handling for themes and dynamic-components
                if (type === "themes") {
                    const themes = await getAxionsRegistryThemes();
                    return { type, data: themes };
                }
                else if (type === "dynamic-components") {
                    const dynamicComponents = await getAxionsRegistryDynamicComponents();
                    return { type, data: dynamicComponents };
                }
                else {
                    const response = await fetch(`${AXIONS_REGISTRY_URL}/r/registry-${type}.json`);
                    if (response.ok) {
                        const rawData = await response.json();
                        // Parse the data through the schema to ensure it's the right type
                        const data = Array.isArray(rawData)
                            ? rawData
                                .map((item) => {
                                try {
                                    return axionsRegistryItemSchema.parse(item);
                                }
                                catch (e) {
                                    console.error(`Error parsing item in ${type}:`, e);
                                    return null;
                                }
                            })
                                .filter(Boolean)
                            : [];
                        return { type, data };
                    }
                    return { type, data: [] };
                }
            }
            catch (error) {
                console.error(`Error fetching registry type ${type}:`, error);
                return { type, data: [] };
            }
        });
        const results = await Promise.all(promises);
        // Organize results by registry type
        results.forEach(({ type, data }) => {
            if (data && Array.isArray(data)) {
                result[type] = data;
            }
        });
        return result;
    }
    catch (error) {
        console.error("Error fetching all components:", error);
        return {};
    }
}
// Find a component by name across all registry types
export async function findComponentByName(name) {
    // First check themes
    const themes = await getAxionsRegistryThemes();
    const theme = themes.find((item) => item.name === name);
    if (theme) {
        return { component: theme, registryType: "themes" };
    }
    // Then check dynamic components
    const dynamicComponents = await getAxionsRegistryDynamicComponents();
    const dynamicComponent = dynamicComponents.find((item) => item.name === name);
    if (dynamicComponent) {
        return { component: dynamicComponent, registryType: "dynamic-components" };
    }
    // Check other registry types
    for (const type of REGISTRY_TYPES.filter((t) => t !== "themes" && t !== "dynamic-components")) {
        try {
            const response = await fetch(`${AXIONS_REGISTRY_URL}/r/registry-${type}.json`);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    const component = data.find((item) => item.name === name);
                    if (component) {
                        return {
                            component: axionsRegistryItemSchema.parse(component),
                            registryType: type,
                        };
                    }
                }
            }
        }
        catch (error) {
            console.error(`Error searching for component ${name} in ${type}:`, error);
        }
    }
    return { component: null, registryType: null };
}
// Get import path for a component based on its registry type
export function getComponentImportPath(name, registryType) {
    switch (registryType) {
        case "ui":
            return `@/components/ui/${name}`;
        case "blocks":
            return `@/components/blocks/${name}`;
        case "auth":
            return `@/components/auth/${name}`;
        case "charts":
            return `@/components/charts/${name}`;
        case "dynamic-components":
            return `@/components/dynamic/${name}`;
        case "hooks":
            return `@/hooks/${name}`;
        case "icons":
            return `@/components/icons/${name}`;
        case "lib":
            return `@/lib/${name}`;
        case "themes":
            return `@/themes/${name}`;
        default:
            return `@/components/${registryType}/${name}`;
    }
}
// Get theme by name
export async function getAxionsThemeByName(name) {
    const themes = await getAxionsRegistryThemes();
    const theme = themes.find((item) => item.name === name);
    return theme || null;
}
// Get dynamic component by name
export async function getAxionsDynamicComponentByName(name) {
    const dynamicComponents = await getAxionsRegistryDynamicComponents();
    const component = dynamicComponents.find((item) => item.name === name);
    return component || null;
}
