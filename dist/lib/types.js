import { z } from "zod";
// Define schemas based on actual registry.json structure
export const axionsRegistryItemTypeSchema = z.enum([
    "registry:ui",
    "registry:theme",
    "registry:hook",
    "registry:block",
    "registry:dynamic-component",
    "registry:lib",
    "registry:component",
    "registry:page",
    "registry:file",
    "registry:actions",
    "registry:api",
    "registry:auth_comp",
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
export const axionsRegistryIndexSchema = z.object({
    name: z.string(),
    homepage: z.string(),
    items: z.array(axionsRegistryItemSchema),
});
export const axionsStylesSchema = z.array(z.object({
    name: z.string(),
    label: z.string(),
}));
