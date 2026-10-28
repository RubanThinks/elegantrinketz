/**
 * Unit Test: Online Order Stock Inventory Reduction Logic
 * Verifies how inventory deduction operates when an order is paid and confirmed.
 */

function simulateInventoryDeduction(product, requestedItems) {
  const currentSizes = Array.isArray(product.sizes) ? JSON.parse(JSON.stringify(product.sizes)) : [];
  
  // Case A: Flat / One-size product without sizes array
  if (currentSizes.length === 0) {
    const totalRequested = requestedItems.reduce((acc, item) => acc + item.quantity, 0);
    const topStock = typeof product.totalStock === "number" ? product.totalStock : (product.stock || 0);

    if (topStock < totalRequested) {
      throw new Error(`Insufficient stock for "${product.name}": available ${topStock}, ordered ${totalRequested}.`);
    }

    const totalRemainingStock = Math.max(0, topStock - totalRequested);
    const isOutOfStock = totalRemainingStock <= 0;
    const inventoryStatus = totalRemainingStock === 0 ? "out_of_stock" : totalRemainingStock <= 3 ? "low_stock" : "in_stock";

    return {
      sizes: [],
      totalStock: totalRemainingStock,
      stock: totalRemainingStock,
      inventoryStatus,
      isOutOfStock,
    };
  }

  // Case B: Size variant product
  for (const item of requestedItems) {
    const sizeIndex = currentSizes.findIndex(
      (s) => s.id === item.sizeId || s.name === item.sizeName
    );

    if (sizeIndex === -1) {
      throw new Error(`Variant "${item.sizeId || item.sizeName}" not found for product "${product.name}".`);
    }

    const currentStock = currentSizes[sizeIndex].stock || 0;
    if (currentStock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}" (${currentSizes[sizeIndex].name}): available ${currentStock}, ordered ${item.quantity}.`
      );
    }

    const newStock = currentStock - item.quantity;
    currentSizes[sizeIndex] = {
      ...currentSizes[sizeIndex],
      stock: newStock,
      isAvailable: newStock > 0,
    };
  }

  const totalRemainingStock = currentSizes.reduce((sum, s) => sum + Math.max(0, s.stock || 0), 0);
  const isOutOfStock = totalRemainingStock <= 0;
  const inventoryStatus = totalRemainingStock === 0 ? "out_of_stock" : totalRemainingStock <= 3 ? "low_stock" : "in_stock";

  return {
    sizes: currentSizes,
    totalStock: totalRemainingStock,
    stock: totalRemainingStock,
    inventoryStatus,
    isOutOfStock,
  };
}

console.log("==================================================");
console.log("TESTING POST-PAYMENT INVENTORY DEDUCTION LOGIC");
console.log("==================================================");

let passed = 0;
let failed = 0;

function assert(description, fn) {
  try {
    if (fn()) {
      console.log(`[PASS] ${description}`);
      passed++;
    } else {
      console.error(`[FAIL] ${description}`);
      failed++;
    }
  } catch (err) {
    console.error(`[FAIL] ${description}:`, err.message);
    failed++;
  }
}

// 1. Single size reduction
assert("Size Variant: Stock correctly decrements by ordered quantity", () => {
  const product = {
    name: "Embroidered Kurthi",
    sizes: [
      { id: "S", name: "S", stock: 10, isAvailable: true },
      { id: "M", name: "M", stock: 5, isAvailable: true },
    ],
  };
  const result = simulateInventoryDeduction(product, [{ sizeId: "S", quantity: 2 }]);
  const sSize = result.sizes.find((s) => s.id === "S");
  return sSize.stock === 8 && sSize.isAvailable === true && result.totalStock === 13 && result.inventoryStatus === "in_stock";
});

// 2. Reducing variant stock to zero marks variant isAvailable = false
assert("Size Variant: Depleting a size marks it unavailable but keeps product in_stock if other sizes remain", () => {
  const product = {
    name: "Embroidered Kurthi",
    sizes: [
      { id: "S", name: "S", stock: 2, isAvailable: true },
      { id: "M", name: "M", stock: 8, isAvailable: true },
    ],
  };
  const result = simulateInventoryDeduction(product, [{ sizeId: "S", quantity: 2 }]);
  const sSize = result.sizes.find((s) => s.id === "S");
  return sSize.stock === 0 && sSize.isAvailable === false && result.totalStock === 8 && result.inventoryStatus === "in_stock" && !result.isOutOfStock;
});

// 3. Reducing all variants to zero transitions product to out_of_stock
assert("Product Status: When all variants deplete to 0, status becomes out_of_stock and isOutOfStock = true", () => {
  const product = {
    name: "Embroidered Kurthi",
    sizes: [
      { id: "S", name: "S", stock: 1, isAvailable: true },
      { id: "M", name: "M", stock: 0, isAvailable: false },
    ],
  };
  const result = simulateInventoryDeduction(product, [{ sizeId: "S", quantity: 1 }]);
  return result.totalStock === 0 && result.isOutOfStock === true && result.inventoryStatus === "out_of_stock";
});

// 4. Low stock threshold (<= 3 items remaining)
assert("Product Status: Remaining stock <= 3 automatically triggers low_stock status", () => {
  const product = {
    name: "Silk Saree",
    sizes: [
      { id: "Free", name: "Free Size", stock: 5, isAvailable: true },
    ],
  };
  const result = simulateInventoryDeduction(product, [{ sizeId: "Free", quantity: 2 }]);
  return result.totalStock === 3 && result.inventoryStatus === "low_stock" && result.isOutOfStock === false;
});

// 5. Over-ordering prevention throws error and blocks order
assert("Overselling Protection: Attempting to order more than available stock is rejected", () => {
  const product = {
    name: "Designer Lehenga",
    sizes: [
      { id: "M", name: "M", stock: 1, isAvailable: true },
    ],
  };
  try {
    simulateInventoryDeduction(product, [{ sizeId: "M", quantity: 2 }]);
    return false; // Should not reach here
  } catch (err) {
    return err.message.includes("Insufficient stock");
  }
});

// 6. Flat / One-size stock reduction
assert("Flat Stock: Product without size variants decrements totalStock and stock fields directly", () => {
  const product = {
    name: "Gold Plated Earrings",
    totalStock: 10,
    stock: 10,
    sizes: [],
  };
  const result = simulateInventoryDeduction(product, [{ quantity: 4 }]);
  return result.totalStock === 6 && result.stock === 6 && result.inventoryStatus === "in_stock";
});

console.log(`\nRESULTS: ${passed}/${passed + failed} PASSED (${failed} FAILED)`);
if (failed > 0) process.exit(1);
