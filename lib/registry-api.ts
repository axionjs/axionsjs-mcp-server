import type { z } from "zod";
import fetch from "node-fetch";
import {
  axionsRegistryItemSchema,
  axionsRegistryIndexSchema,
  axionsStylesSchema,
} from "./types.js";

// Define the AxionsRegistryItem type for TypeScript
export type AxionsRegistryItem = z.infer<typeof axionsRegistryItemSchema>;

const AXIONS_REGISTRY_URL =
  process.env.AXIONS_REGISTRY_URL || "http://localhost:3000";

const registryCache = new Map<string, Promise<any>>();

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
] as const;

// Type for registry type strings
type RegistryTypeString = (typeof REGISTRY_TYPES)[number];

export async function getAxionsRegistryIndex(): Promise<z.infer<
  typeof axionsRegistryIndexSchema
> | null> {
  try {
    const response = await fetch(`${AXIONS_REGISTRY_URL}/registry.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry index: ${response.statusText}`);
    }
    const data = await response.json();
    return axionsRegistryIndexSchema.parse(data);
  } catch (error) {
    console.error("Error fetching registry index:", error);
    return null;
  }
}

export async function getAxionsRegistryStyles(): Promise<
  z.infer<typeof axionsStylesSchema>
> {
  try {
    const response = await fetch(`${AXIONS_REGISTRY_URL}/r/styles/index.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch styles: ${response.statusText}`);
    }
    const data = await response.json();
    return axionsStylesSchema.parse(data);
  } catch (error) {
    console.error("Error fetching registry styles:", error);
    return [];
  }
}

export async function getAxionsRegistryThemes(): Promise<AxionsRegistryItem[]> {
  try {
    const response = await fetch(`${AXIONS_REGISTRY_URL}/r/themes/index.json`);
    if (!response.ok) {
      // Try alternative path
      const altResponse = await fetch(
        `${AXIONS_REGISTRY_URL}/r/registry-themes.json`
      );
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
  } catch (error) {
    console.error("Error fetching registry themes:", error);
    return [];
  }
}
export async function getAxionsRegistryDynamicComponents(): Promise<
  AxionsRegistryItem[]
> {
  try {
    const response = await fetch(`${AXIONS_REGISTRY_URL}/registry.json`);
    if (!response.ok) {
      // Try alternative path
      const altResponse = await fetch(
        `${AXIONS_REGISTRY_URL}/r/styles/new-york/index.json`
      );
      if (!altResponse.ok) {
        throw new Error(
          `Failed to fetch dynamic components: ${response.statusText}`
        );
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
  } catch (error) {
    console.error("Error fetching registry dynamic components:", error);
    return [];
  }
}

export async function getAxionsRegistryItem(
  name: string,
  style = "new-york"
): Promise<AxionsRegistryItem | null> {
  try {
    const url = `${AXIONS_REGISTRY_URL}/r/styles/${style}/${name}.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Component '${name}' not found in style '${style}'`);
    }

    const data = await response.json();
    return axionsRegistryItemSchema.parse(data);
  } catch (error) {
    console.error(`Error fetching registry item ${name}:`, error);
    return null;
  }
}

export async function getAxionsComponentsByCategory(
  category?: string
): Promise<AxionsRegistryItem[]> {
  const index = await getAxionsRegistryIndex();
  if (!index) return [];

  if (!category) return index.items;

  return index.items.filter(
    (item: AxionsRegistryItem) =>
      item.categories?.includes(category) || item.type.includes(category)
  );
}

export async function searchAxionsComponents(
  query: string
): Promise<AxionsRegistryItem[]> {
  const index = await getAxionsRegistryIndex();
  if (!index) return [];

  const searchTerm = query.toLowerCase();
  return index.items.filter(
    (item: AxionsRegistryItem) =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))
  );
}

export async function getAxionsComponentMetadata(name: string): Promise<{
  item: AxionsRegistryItem | null;
  dependencies: string[];
  registryDependencies: string[];
  totalFiles: number;
}> {
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

export async function resolveAxionsComponentTree(names: string[]): Promise<{
  resolved: AxionsRegistryItem[];
  dependencies: string[];
  installCommand: string;
}> {
  const resolved: AxionsRegistryItem[] = [];
  const allDependencies = new Set<string>();
  const processedNames = new Set<string>();

  async function resolveComponent(name: string) {
    if (processedNames.has(name)) return;
    processedNames.add(name);

    const item = await getAxionsRegistryItem(name);
    if (!item) return;

    resolved.push(item);

    // Add npm dependencies
    item.dependencies?.forEach((dep: string) => allDependencies.add(dep));

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

export function generateAxionsInstallCommand(
  components: string[],
  options?: {
    overwrite?: boolean;
    path?: string;
    style?: string;
  }
): string {
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
export async function getAllAxionsComponents(): Promise<{
  [key: string]: AxionsRegistryItem[];
}> {
  const result: { [key: string]: AxionsRegistryItem[] } = {};

  try {
    // Fetch all registry types in parallel
    const promises = REGISTRY_TYPES.map(async (type) => {
      try {
        // Special handling for themes and dynamic-components
        if (type === "themes") {
          const themes = await getAxionsRegistryThemes();
          return { type, data: themes };
        } else if (type === "dynamic-components") {
          const dynamicComponents = await getAxionsRegistryDynamicComponents();
          return { type, data: dynamicComponents };
        } else {
          const response = await fetch(
            `${AXIONS_REGISTRY_URL}/r/registry-${type}.json`
          );
          if (response.ok) {
            const rawData = await response.json();
            // Parse the data through the schema to ensure it's the right type
            const data = Array.isArray(rawData)
              ? (rawData
                  .map((item) => {
                    try {
                      return axionsRegistryItemSchema.parse(item);
                    } catch (e) {
                      console.error(`Error parsing item in ${type}:`, e);
                      return null;
                    }
                  })
                  .filter(Boolean) as AxionsRegistryItem[])
              : [];
            return { type, data };
          }
          return { type, data: [] };
        }
      } catch (error) {
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
  } catch (error) {
    console.error("Error fetching all components:", error);
    return {};
  }
}

// Find a component by name across all registry types
export async function findComponentByName(name: string): Promise<{
  component: AxionsRegistryItem | null;
  registryType: RegistryTypeString | null;
}> {
  // First check themes
  const themes = await getAxionsRegistryThemes();
  const theme = themes.find((item: any) => item.name === name);
  if (theme) {
    return { component: theme, registryType: "themes" };
  }

  // Then check dynamic components
  const dynamicComponents = await getAxionsRegistryDynamicComponents();
  const dynamicComponent = dynamicComponents.find(
    (item: any) => item.name === name
  );
  if (dynamicComponent) {
    return { component: dynamicComponent, registryType: "dynamic-components" };
  }

  // Check other registry types
  for (const type of REGISTRY_TYPES.filter(
    (t) => t !== "themes" && t !== "dynamic-components"
  )) {
    try {
      const response = await fetch(
        `${AXIONS_REGISTRY_URL}/r/registry-${type}.json`
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const component = data.find((item: any) => item.name === name);
          if (component) {
            return {
              component: axionsRegistryItemSchema.parse(component),
              registryType: type,
            };
          }
        }
      }
    } catch (error) {
      console.error(`Error searching for component ${name} in ${type}:`, error);
    }
  }

  return { component: null, registryType: null };
}

// Get import path for a component based on its registry type
export function getComponentImportPath(
  name: string,
  registryType: RegistryTypeString
): string {
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
export async function getAxionsThemeByName(
  name: string
): Promise<AxionsRegistryItem | null> {
  const themes = await getAxionsRegistryThemes();
  const theme = themes.find((item: any) => item.name === name);
  return theme || null;
}

// Get dynamic component by name
export async function getAxionsDynamicComponentByName(
  name: string
): Promise<AxionsRegistryItem | null> {
  const dynamicComponents = await getAxionsRegistryDynamicComponents();
  const component = dynamicComponents.find((item: any) => item.name === name);
  return component || null;
}
