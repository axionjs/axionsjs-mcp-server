import {
  fetchComponentsByType,
  fetchExampleComponents,
  findComponentByName,
} from "./dist/lib/registry-api.js";

console.log("Additional tests:");

// Test blocks
const blocks = await fetchComponentsByType("block");
console.log("Blocks found:", blocks.length);
if (blocks.length > 0) {
  console.log("Example block:", blocks[0].name, "-", blocks[0].description);
}

// Test examples
const examples = await fetchExampleComponents();
console.log("Examples found:", examples.length);

// Test finding different components
const components = ["hero-section", "login-form", "line-chart", "dark-theme"];
for (const name of components) {
  const { component, registryType } = await findComponentByName(name);
  if (component) {
    console.log(`Found: ${name} in ${registryType} registry`);
  }
}
