/**
 * Phase 3.1 Inventory Consistency and Identifier Validation Tests
 */

import { calculateProductInventory, slugify } from "../src/services/products/index.ts";

const tests = [
  {
    name: "Inventory sanitization: negative stock coerced to 0",
    run: () => {
      const result = calculateProductInventory([
        { id: "S", name: "S", stock: -10, isAvailable: true },
        { id: "M", name: "M", stock: 5, isAvailable: true },
      ]);
      return result.totalStock === 5 && result.inventoryStatus === "in_stock" && !result.isOutOfStock;
    },
  },
  {
    name: "Inventory sanitization: floating point stock floored to integer",
    run: () => {
      const result = calculateProductInventory([
        { id: "S", name: "S", stock: 2.7, isAvailable: true },
      ]);
      return result.totalStock === 2 && result.inventoryStatus === "low_stock";
    },
  },
  {
    name: "Inventory sanitization: string numeric stock parsed safely",
    run: () => {
      const result = calculateProductInventory([
        { id: "S", name: "S", stock: "8", isAvailable: true },
      ]);
      return result.totalStock === 8 && result.inventoryStatus === "in_stock";
    },
  },
  {
    name: "Inventory empty sizes results in out_of_stock",
    run: () => {
      const result = calculateProductInventory([]);
      return result.totalStock === 0 && result.isOutOfStock && result.inventoryStatus === "out_of_stock";
    },
  },
  {
    name: "Inventory total zero results in out_of_stock",
    run: () => {
      const result = calculateProductInventory([
        { id: "S", name: "S", stock: 0, isAvailable: false },
        { id: "M", name: "M", stock: 0, isAvailable: false },
      ]);
      return result.totalStock === 0 && result.isOutOfStock && result.inventoryStatus === "out_of_stock";
    },
  },
  {
    name: "Inventory low stock threshold: <= 3 is low_stock",
    run: () => {
      const result = calculateProductInventory([
        { id: "S", name: "S", stock: 2, isAvailable: true },
        { id: "M", name: "M", stock: 1, isAvailable: true },
      ]);
      return result.totalStock === 3 && result.inventoryStatus === "low_stock" && !result.isOutOfStock;
    },
  },
  {
    name: "Slugify generates clean URL-safe lowercase slugs",
    run: () => {
      const slug = slugify("Banarasi Silk & Zari Saree — Festive Edition!");
      return slug === "banarasi-silk-and-zari-saree-festive-edition";
    },
  },
];

console.log("==================================================");
console.log("RUNNING INVENTORY & UNIQUENESS UNIT TESTS");
console.log("==================================================");

let passed = 0;
for (const t of tests) {
  try {
    const ok = t.run();
    if (ok) {
      passed++;
      console.log(`[PASS] ${t.name}`);
    } else {
      console.error(`[FAIL] ${t.name}`);
    }
  } catch (err) {
    console.error(`[ERROR] ${t.name}:`, err.message);
  }
}

console.log(`RESULTS: ${passed}/${tests.length} PASSED`);
if (passed !== tests.length) process.exit(1);
