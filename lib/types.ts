import { z } from "zod";

// Define registry types
export type AxionsRegistryType =
  | "ui"
  | "hooks"
  | "blocks"
  | "auth"
  | "charts"
  | "dynamic-components"
  | "icons"
  | "lib"
  | "styles"
  | "themes";

// Define schemas
export const axionsRegistryItemTypeSchema = z.enum([
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:page",
  "registry:file",
  "registry:theme",
  "registry:style",
  "registry:example",
  "registry:internal",
  "registry:auth",
  "registry:chart",
  "registry:dynamic-component",
  "registry:icon",
  "registry:actions",
  "registry:api",
  "registry:email",
  "registry:middleware",
  "registry:schemas",
]);

export const axionsRegistryItemFileSchema = z.discriminatedUnion("type", [
  z.object({
    path: z.string(),
    content: z.string().optional(),
    type: z.enum(["registry:file", "registry:page"]),
    target: z.string(),
  }),
  z.object({
    path: z.string(),
    content: z.string().optional(),
    type: axionsRegistryItemTypeSchema.exclude([
      "registry:file",
      "registry:page",
    ]),
    target: z.string().optional(),
  }),
]);

export const axionsRegistryItemTailwindSchema = z.object({
  config: z
    .object({
      content: z.array(z.string()).optional(),
      theme: z.record(z.string(), z.any()).optional(),
      plugins: z.array(z.string()).optional(),
    })
    .optional(),
});

export const axionsRegistryItemCssVarsSchema = z.object({
  theme: z.record(z.string(), z.string()).optional(),
  light: z.record(z.string(), z.string()).optional(),
  dark: z.record(z.string(), z.string()).optional(),
});

export const axionsRegistryItemSchema = z.object({
  $schema: z.string().optional(),
  extends: z.string().optional(),
  name: z.string(),
  type: axionsRegistryItemTypeSchema,
  title: z.string().optional(),
  label: z.string().optional(),
  author: z.string().min(2).optional(),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(axionsRegistryItemFileSchema).optional(),
  tailwind: axionsRegistryItemTailwindSchema.optional(),
  cssVars: axionsRegistryItemCssVarsSchema.optional(),
  cssVarsV4: axionsRegistryItemCssVarsSchema.optional(),
  activeColor: z.record(z.string(), z.string()).optional(),
  meta: z.record(z.string(), z.any()).optional(),
  docs: z.string().optional(),
  categories: z.array(z.string()).optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const axionsRegistryIndexSchema = z.array(axionsRegistryItemSchema);

export const axionsStylesSchema = z.array(
  z.object({
    name: z.string(),
    label: z.string(),
  })
);

export type AxionsRegistryItem = z.infer<typeof axionsRegistryItemSchema>;
export type AxionsRegistryIndex = z.infer<typeof axionsRegistryIndexSchema>;
export type AxionsStyles = z.infer<typeof axionsStylesSchema>;
