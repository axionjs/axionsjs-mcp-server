import { z } from "zod";
import fetch from "node-fetch";
import {
  axionsRegistryItemSchema,
  axionsRegistryIndexSchema,
  axionsStylesSchema,
} from "./types.js";

// Define the AxionsRegistryItem and related types for TypeScript
export type AxionsRegistryItem = z.infer<typeof axionsRegistryItemSchema>;
export type AxionsRegistryIndex = z.infer<typeof axionsRegistryIndexSchema>;

// Use environment variable for AxionsJS registry URL
const AXIONJS_REGISTRY_URL =
  process.env.AXIONJS_REGISTRY_URL || "http://localhost:3001";

// Cache for registry data
const registryCache = new Map<string, any>();

// Define component and example schemas similar to MagicUI
export const ComponentSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
});

export const ComponentDetailSchema = axionsRegistryItemSchema;

export const ExampleComponentSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
  registryDependencies: z.array(z.string()).optional(),
});

export const ExampleDetailSchema = axionsRegistryItemSchema;

// List of all registry types based on actual registry.json structure
const REGISTRY_TYPES = [
  "ui",
  "theme",
  "hook",
  "block",
  "dynamic-component",
  "lib",
  "component",
  "page",
  "file",
  "actions",
  "api",
  "auth_comp",
  "email",
  "middleware",
  "schemas",
] as const;

// Type for registry type strings
type RegistryTypeString = (typeof REGISTRY_TYPES)[number];

// Function to fetch UI components from AxionsJS
export async function fetchUIComponents(): Promise<
  z.infer<typeof ComponentSchema>[]
> {
  try {
    const response = await fetch(`${AXIONJS_REGISTRY_URL}/registry.json`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch registry.json: ${response.statusText} (Status: ${response.status})`
      );
    }
    const data = await response.json();
    const registryData = axionsRegistryIndexSchema.parse(data);

    return registryData.items
      .filter((item) => item.type === "registry:ui")
      .map((item) => {
        try {
          return ComponentSchema.parse({
            name: item.name,
            type: item.type,
            description: item.description,
          });
        } catch (parseError) {
          return null;
        }
      })
      .filter(Boolean) as z.infer<typeof ComponentSchema>[];
  } catch (error) {
    console.error("Error fetching AxionsJS UI components:", error);
    return [];
  }
}

// Function to fetch component with actual code content
export async function fetchComponentWithCode(
  name: string,
  style: string = "new-york"
): Promise<AxionsRegistryItem | null> {
  try {
    // First check if component exists in registry.json
    const registryResponse = await fetch(
      `${AXIONJS_REGISTRY_URL}/registry.json`
    );
    if (!registryResponse.ok) {
      throw new Error(
        `Failed to fetch registry.json: ${registryResponse.statusText}`
      );
    }
    const registryData = await registryResponse.json();
    const registry = axionsRegistryIndexSchema.parse(registryData);

    // Find the component in registry
    const componentMeta = registry.items.find((item) => item.name === name);
    if (!componentMeta) {
      console.warn(`Component ${name} not found in registry.json`);
      return null;
    }

    // Try to fetch the actual component code from style-specific endpoint
    try {
      const codeResponse = await fetch(
        `${AXIONJS_REGISTRY_URL}/r/styles/${style}/${name}.json`
      );
      if (codeResponse.ok) {
        const codeData = await codeResponse.json();
        const componentWithCode = axionsRegistryItemSchema.parse(codeData);

        // Merge metadata from registry.json with code from style endpoint
        return {
          ...componentMeta,
          ...componentWithCode,
          // Ensure we have both metadata and code
          files: componentWithCode.files || componentMeta.files,
        };
      } else {
        console.warn(
          `Style-specific component endpoint not available: /r/styles/${style}/${name}.json`
        );
      }
    } catch (codeError) {
      console.warn(
        `Failed to fetch component code from style endpoint:`,
        (codeError as Error).message || codeError
      );
    }

    // Try alternative endpoint format: /r/{name}.json
    try {
      const altResponse = await fetch(`${AXIONJS_REGISTRY_URL}/r/${name}.json`);
      if (altResponse.ok) {
        const altData = await altResponse.json();
        const componentWithCode = axionsRegistryItemSchema.parse(altData);

        return {
          ...componentMeta,
          ...componentWithCode,
          files: componentWithCode.files || componentMeta.files,
        };
      }
    } catch (altError) {
      console.warn(
        `Alternative component endpoint not available: /r/${name}.json`
      );
    }

    // If no code endpoints work, return metadata from registry.json
    // This ensures the function always returns the component metadata even if code fetching fails
    console.warn(
      `Returning component metadata only for ${name} (code endpoints unavailable)`
    );
    return componentMeta;
  } catch (error) {
    console.error(`Error fetching component ${name} with code:`, error);
    return null;
  }
}

// Function to fetch individual component details (updated to use code endpoint)
export async function fetchComponentDetails(
  name: string,
  style: string = "new-york"
): Promise<z.infer<typeof ComponentDetailSchema> | null> {
  return fetchComponentWithCode(name, style);
}

// Function to fetch example components
export async function fetchExampleComponents(): Promise<
  z.infer<typeof ExampleComponentSchema>[]
> {
  try {
    const response = await fetch(`${AXIONJS_REGISTRY_URL}/registry.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry.json: ${response.statusText}`);
    }
    const data = await response.json();
    const registryData = axionsRegistryIndexSchema.parse(data);

    return registryData.items
      .filter((item) => item.type === "registry:block") // Blocks can serve as examples
      .map((item) => {
        return ExampleComponentSchema.parse({
          name: item.name,
          type: item.type,
          description: item.description,
          registryDependencies: item.registryDependencies,
        });
      });
  } catch (error) {
    console.error("Error fetching AxionJS example components:", error);
    return [];
  }
}

// Function to fetch details for a specific example
export async function fetchExampleDetails(
  exampleName: string
): Promise<z.infer<typeof ExampleDetailSchema> | null> {
  try {
    const response = await fetch(`${AXIONJS_REGISTRY_URL}/r/${exampleName}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch example details for ${exampleName}: ${response.statusText}`
      );
    }
    const data = await response.json();
    return ExampleDetailSchema.parse(data);
  } catch (error) {
    console.error(`Error fetching example details for ${exampleName}:`, error);
    return null;
  }
}

// Function to get the main registry index
export async function getAxionsRegistryIndex(): Promise<AxionsRegistryIndex | null> {
  try {
    const response = await fetch(`${AXIONJS_REGISTRY_URL}/registry.json`);
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

// Function to fetch components by type from registry.json
export async function fetchComponentsByType(
  type: string
): Promise<AxionsRegistryItem[]> {
  try {
    const response = await fetch(`${AXIONJS_REGISTRY_URL}/registry.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry.json: ${response.statusText}`);
    }
    const data = await response.json();
    const registryData = axionsRegistryIndexSchema.parse(data);

    return registryData.items.filter(
      (item) => item.type === `registry:${type}`
    );
  } catch (error) {
    console.error(`Error fetching ${type} components:`, error);
    return [];
  }
}

// Function to fetch all available components grouped by type
export async function getAllAxionsComponents(): Promise<{
  [key: string]: AxionsRegistryItem[];
}> {
  try {
    const response = await fetch(`${AXIONJS_REGISTRY_URL}/registry.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry.json: ${response.statusText}`);
    }
    const data = await response.json();
    const registryData = axionsRegistryIndexSchema.parse(data);

    const result: { [key: string]: AxionsRegistryItem[] } = {};

    // Group items by their type (removing 'registry:' prefix)
    registryData.items.forEach((item) => {
      const type = item.type.replace("registry:", "");
      if (!result[type]) {
        result[type] = [];
      }
      result[type].push(item);
    });

    return result;
  } catch (error) {
    console.error("Error fetching all components:", error);
    return {};
  }
}

// Function to find a component by name across all types
export async function findComponentByName(
  name: string,
  fetchCode: boolean = false,
  style: string = "new-york"
): Promise<{
  component: AxionsRegistryItem | null;
  registryType: string | null;
}> {
  try {
    const response = await fetch(`${AXIONJS_REGISTRY_URL}/registry.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry.json: ${response.statusText}`);
    }
    const data = await response.json();
    const registryData = axionsRegistryIndexSchema.parse(data);

    const componentMeta = registryData.items.find((item) => item.name === name);
    if (componentMeta) {
      const registryType = componentMeta.type.replace("registry:", "");

      if (fetchCode) {
        // Fetch the component with actual code content
        const componentWithCode = await fetchComponentWithCode(name, style);
        return { component: componentWithCode, registryType };
      } else {
        // Return just metadata
        return { component: componentMeta, registryType };
      }
    }

    return { component: null, registryType: null };
  } catch (error) {
    console.error(`Error searching for component ${name}:`, error);
    return { component: null, registryType: null };
  }
}

// Legacy function compatibility - get components by category
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

// Legacy function compatibility - search components
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

// Legacy function compatibility - get component metadata
export async function getAxionsComponentMetadata(name: string): Promise<{
  item: AxionsRegistryItem | null;
  dependencies: string[];
  registryDependencies: string[];
  totalFiles: number;
}> {
  const { component } = await findComponentByName(name);

  if (!component) {
    return {
      item: null,
      dependencies: [],
      registryDependencies: [],
      totalFiles: 0,
    };
  }

  return {
    item: component,
    dependencies: component.dependencies || [],
    registryDependencies: component.registryDependencies || [],
    totalFiles: component.files?.length || 0,
  };
}

// Legacy function compatibility - resolve component tree
export async function resolveAxionsComponentTree(
  names: string[],
  style: string = "new-york"
): Promise<{
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

    // Fetch component with code
    const { component } = await findComponentByName(name, true, style);
    if (!component) return;

    resolved.push(component);

    // Add npm dependencies
    component.dependencies?.forEach((dep: string) => allDependencies.add(dep));

    // Recursively resolve registry dependencies (but without code for dependencies)
    if (component.registryDependencies) {
      for (const dep of component.registryDependencies) {
        await resolveComponent(dep);
      }
    }
  }

  for (const name of names) {
    await resolveComponent(name);
  }

  const installCommand = `npx axionjs-ui add ${names.join(" ")}`;

  return {
    resolved,
    dependencies: Array.from(allDependencies),
    installCommand,
  };
}

// Legacy function compatibility - generate install command
export function generateAxionsInstallCommand(
  components: string[],
  options?: {
    overwrite?: boolean;
    path?: string;
    style?: string;
  }
): string {
  let command = `npx axionjs-ui add ${components.join(" ")}`;

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

// Legacy function compatibility - get styles
export async function getAxionsRegistryStyles(): Promise<
  z.infer<typeof axionsStylesSchema>
> {
  try {
    // Try to get styles from the main registry
    const response = await fetch(`${AXIONJS_REGISTRY_URL}/registry.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch styles: ${response.statusText}`);
    }
    const data = await response.json();
    const registryData = axionsRegistryIndexSchema.parse(data);

    // Since there are no specific style entries in the registry,
    // return default styles or extract from themes if available
    const styles = [
      { name: "default", label: "Default" },
      { name: "new-york", label: "New York" },
    ];

    return axionsStylesSchema.parse(styles);
  } catch (error) {
    console.error("Error fetching registry styles:", error);
    return [];
  }
}

// Get import path for a component based on its registry type
export function getComponentImportPath(
  name: string,
  registryType: (typeof REGISTRY_TYPES)[number]
): string {
  switch (registryType) {
    case "ui":
      return `@/components/ui/${name}`;
    case "block":
      return `@/components/blocks/${name}`;
    case "auth_comp":
      return `@/components/auth/${name}`;
    case "component":
      return `@/components/${name}`;
    case "dynamic-component":
      return `@/components/dynamic/${name}`;
    case "hook":
      return `@/hooks/${name}`;
    case "lib":
      return `@/lib/${name}`;
    case "theme":
      return `@/themes/${name}`;
    case "page":
      return `@/app/${name}`;
    case "file":
      return `@/${name}`;
    case "actions":
      return `@/actions/${name}`;
    case "api":
      return `@/api/${name}`;
    case "email":
      return `@/emails/${name}`;
    case "middleware":
      return `@/middleware/${name}`;
    case "schemas":
      return `@/schemas/${name}`;
    default:
      return `@/components/${registryType}/${name}`;
  }
}

// Backward compatibility functions
export async function getAxionsRegistryThemes(): Promise<AxionsRegistryItem[]> {
  return fetchComponentsByType("theme");
}

export async function getAxionsRegistryDynamicComponents(): Promise<
  AxionsRegistryItem[]
> {
  return fetchComponentsByType("dynamic-component");
}

export async function getAxionsThemeByName(
  name: string
): Promise<AxionsRegistryItem | null> {
  const { component, registryType } = await findComponentByName(name);
  if (registryType === "theme") {
    return component;
  }
  return null;
}

export async function getAxionsDynamicComponentByName(
  name: string
): Promise<AxionsRegistryItem | null> {
  const { component, registryType } = await findComponentByName(name);
  if (registryType === "dynamic-component") {
    return component;
  }
  return null;
}

export async function getAxionsRegistryItem(
  name: string,
  style = "new-york"
): Promise<AxionsRegistryItem | null> {
  try {
    // Use the new fetchComponentWithCode function to get component with actual code
    return await fetchComponentWithCode(name, style);
  } catch (error) {
    console.error(`Error fetching registry item ${name}:`, error);
    return null;
  }
}
