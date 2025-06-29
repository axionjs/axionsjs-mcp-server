#!/usr/bin/env node

// Test script for the AxionsJS MCP package
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log("🧪 Testing AxionsJS MCP Package...\n");

// Test 1: Check package.json
try {
  const packagePath = join(__dirname, "..", "package.json");
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));

  console.log("✅ Package.json validation:");
  console.log(`   Name: ${pkg.name}`);
  console.log(`   Version: ${pkg.version}`);
  console.log(`   Main: ${pkg.main}`);
  console.log(`   Binary: ${Object.keys(pkg.bin || {}).join(", ")}`);
  console.log("");
} catch (error) {
  console.error("❌ Package.json error:", error.message);
  process.exit(1);
}

// Test 2: Check if built files exist
import { existsSync } from "fs";

const requiredFiles = [
  "dist/mcp/server.js",
  "dist/lib/registry-api.js",
  "dist/lib/component-generator.js",
  "dist/lib/types.js",
  "dist/lib/utils.js",
  "bin/axionsjs-mcp.js",
];

console.log("✅ Required files check:");
let allFilesExist = true;

for (const file of requiredFiles) {
  const filePath = join(__dirname, "..", file);
  const exists = existsSync(filePath);
  console.log(`   ${exists ? "✅" : "❌"} ${file}`);
  if (!exists) allFilesExist = false;
}

if (!allFilesExist) {
  console.error(
    '\n❌ Some required files are missing. Run "npm run build:mcp" first.'
  );
  process.exit(1);
}

console.log("\n✅ All tests passed! Package is ready for publication.");
console.log("\nNext steps:");
console.log("1. npm pack --dry-run  # Preview package contents");
console.log("2. npm pack            # Create tarball for testing");
console.log("3. npm publish         # Publish to NPM");
