import type { z } from "zod";
import fetch from "node-fetch";
import {
  axionsRegistryItemSchema,
  axionsRegistryIndexSchema,
  axionsStylesSchema,
  type AxionsRegistryItem,
} from "./types.js";

const AXIONS_REGISTRY_URL =
  process.env.AXIONS_REGISTRY_URL || "http://localhost:3000";

const registryCache = new Map<string, Promise<any>>();

export async function getAxionsRegistryIndex(): Promise<z.infer<
  typeof axionsRegistryIndexSchema
> | null> {
  try {
    const response = await fetch(`${AXIONS_REGISTRY_URL}/r/index.json`);
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

  if (!category) return index;

  return index.filter(
    (item) =>
      item.categories?.includes(category) || item.type.includes(category)
  );
}

export async function searchAxionsComponents(
  query: string
): Promise<AxionsRegistryItem[]> {
  const index = await getAxionsRegistryIndex();
  if (!index) return [];

  const searchTerm = query.toLowerCase();
  return index.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
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
