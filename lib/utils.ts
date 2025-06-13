import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Simple function to join class names
export function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

// Function to get registry type from item type
export function getRegistryTypeFromItemType(itemType: string): string {
  if (itemType.includes("ui")) return "ui";
  if (itemType.includes("hook")) return "hooks";
  if (itemType.includes("block")) return "blocks";
  if (itemType.includes("auth")) return "auth";
  if (itemType.includes("chart")) return "charts";
  if (itemType.includes("dynamic")) return "dynamic-components";
  if (itemType.includes("icon")) return "icons";
  if (itemType.includes("lib")) return "lib";
  if (itemType.includes("style")) return "styles";
  if (itemType.includes("theme")) return "themes";
  return "ui"; // Default to UI
}

// Function to format component name for display
export function formatComponentName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
