#!/usr/bin/env node
import {
  fetchComponentWithCode,
  fetchComponentDetails,
  getAxionsRegistryItem,
  findComponentByName,
} from "./dist/lib/registry-api.js";

console.log("🧪 Testing Component Code Fetching...\n");

async function testCodeFetching() {
  try {
    console.log('1. Testing fetchComponentWithCode for "button"...');
    const buttonWithCode = await fetchComponentWithCode("button", "new-york");

    if (buttonWithCode) {
      console.log(`   ✅ Fetched button component`);
      console.log(`   Type: ${buttonWithCode.type}`);
      console.log(`   Files: ${buttonWithCode.files?.length || 0}`);

      if (buttonWithCode.files && buttonWithCode.files.length > 0) {
        const mainFile = buttonWithCode.files[0];
        console.log(`   First file: ${mainFile.path}`);

        if (mainFile.content) {
          console.log(
            `   ✅ Component has code content (${mainFile.content.length} characters)`
          );
          console.log(
            `   Code preview: ${mainFile.content.substring(0, 100)}...`
          );
        } else {
          console.log(`   ❌ No code content found`);
        }
      } else {
        console.log(`   ❌ No files found`);
      }
    } else {
      console.log(`   ❌ Failed to fetch button component`);
    }

    console.log("\n2. Testing getAxionsRegistryItem with code fetching...");
    const registryItem = await getAxionsRegistryItem("accordion", "new-york");

    if (registryItem) {
      console.log(`   ✅ Fetched accordion component`);
      console.log(`   Type: ${registryItem.type}`);
      console.log(`   Files: ${registryItem.files?.length || 0}`);

      if (registryItem.files && registryItem.files.length > 0) {
        const hasCodeContent = registryItem.files.some(
          (file) => file.content && file.content.length > 0
        );
        if (hasCodeContent) {
          console.log(`   ✅ Registry item has code content`);
        } else {
          console.log(`   ❌ Registry item has no code content`);
        }
      }
    } else {
      console.log(`   ❌ Failed to fetch accordion component`);
    }

    console.log("\n3. Testing findComponentByName with and without code...");

    // Without code
    const cardMetaOnly = await findComponentByName("card", false);
    console.log(
      `   Metadata only - Card found: ${cardMetaOnly.component ? "✅" : "❌"}`
    );
    if (cardMetaOnly.component?.files) {
      const hasCode = cardMetaOnly.component.files.some(
        (file) => file.content && file.content.length > 0
      );
      console.log(`   Metadata only - Has code: ${hasCode ? "✅" : "❌"}`);
    }

    // With code
    const cardWithCode = await findComponentByName("card", true, "new-york");
    console.log(
      `   With code - Card found: ${cardWithCode.component ? "✅" : "❌"}`
    );
    if (cardWithCode.component?.files) {
      const hasCode = cardWithCode.component.files.some(
        (file) => file.content && file.content.length > 0
      );
      console.log(`   With code - Has code: ${hasCode ? "✅" : "❌"}`);
    }

    console.log("\n✅ Code fetching tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testCodeFetching();
