import {
  fetchUIComponents,
  fetchComponentsByType,
  findComponentByName,
  getAxionsRegistryIndex,
} from "./dist/lib/registry-api.js";

async function testRegistry() {
  console.log("Testing AxionsJS MCP Server Registry Functions...\n");

  try {
    // Test 1: Get registry index
    console.log("1. Testing getAxionsRegistryIndex...");
    const index = await getAxionsRegistryIndex();
    if (index) {
      console.log(`✅ Found registry with ${index.items.length} items`);
      console.log(`   Homepage: ${index.homepage}`);
    } else {
      console.log("❌ Failed to fetch registry index");
    }

    // Test 2: Fetch UI components
    console.log("\n2. Testing fetchUIComponents...");
    const uiComponents = await fetchUIComponents();
    console.log(`✅ Found ${uiComponents.length} UI components`);
    if (uiComponents.length > 0) {
      console.log(
        `   Example: ${uiComponents[0].name} - ${uiComponents[0].description || "No description"}`
      );
    }

    // Test 3: Fetch components by type
    console.log('\n3. Testing fetchComponentsByType for "blocks"...');
    const blockComponents = await fetchComponentsByType("blocks");
    console.log(`✅ Found ${blockComponents.length} block components`);
    if (blockComponents.length > 0) {
      console.log(
        `   Example: ${blockComponents[0].name} - ${blockComponents[0].description || "No description"}`
      );
    }

    // Test 4: Find component by name (try to find a common component)
    console.log("\n4. Testing findComponentByName...");
    const componentNames = ["button", "card", "hero", "navbar", "footer"];

    for (const name of componentNames) {
      const { component, registryType } = await findComponentByName(name);
      if (component) {
        console.log(`✅ Found component "${name}" in ${registryType} registry`);
        break;
      }
    }
  } catch (error) {
    console.error("❌ Error testing registry:", error.message);
  }
}

testRegistry();
