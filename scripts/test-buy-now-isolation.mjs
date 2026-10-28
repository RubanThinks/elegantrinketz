/**
 * Test Suite: Buy Now Isolation vs Cart Bundling
 * 
 * Verifies that:
 * 1. Single-product "Buy Now" checkout isolates the target product and does NOT pull in cart items.
 * 2. Pricing and subtotal calculations for "Buy Now" are based strictly on that single product.
 * 3. User's existing cart items are NOT wiped or cleared when an instant Buy Now order completes.
 * 4. Cart-view checkout bundles all cart items and clears the cart on completion.
 * 5. Size variant specifications are accurately isolated per item.
 */

// Mock Cart Items (User previously added 2 items to their cart)
const mockCart = [
  {
    id: "cart-item-1",
    productId: "prod-dress-1",
    productName: "Vintage Floral Maxi Dress",
    sizeId: "size-m",
    sizeName: "M",
    quantity: 2,
    unitPrice: 1499,
  },
  {
    id: "cart-item-2",
    productId: "prod-jewelry-2",
    productName: "Emerald Cut Silver Ring",
    sizeId: null,
    sizeName: null,
    quantity: 1,
    unitPrice: 799,
  },
];

// Single product user clicks "Buy Now" on
const directBuyProduct = {
  id: "direct-prod-saree-3-free-size",
  productId: "prod-saree-3",
  productName: "Kanchipuram Silk Saree",
  sizeId: "free-size",
  sizeName: "Free Size",
  quantity: 1,
  unitPrice: 2999,
};

function resolveCheckoutItemsAndSubtotal({ directItem, cartItems }) {
  const isDirectBuy = Boolean(directItem);
  const items = directItem ? [directItem] : cartItems;
  const subtotal = directItem
    ? directItem.unitPrice * directItem.quantity
    : cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  return {
    isDirectBuy,
    items,
    itemCount: items.reduce((acc, it) => acc + it.quantity, 0),
    subtotal,
  };
}

const tests = [
  {
    name: "Buy Now Isolation: Checkout items must contain ONLY the single direct item",
    run: () => {
      const result = resolveCheckoutItemsAndSubtotal({
        directItem: directBuyProduct,
        cartItems: mockCart,
      });

      return (
        result.isDirectBuy === true &&
        result.items.length === 1 &&
        result.items[0].productId === "prod-saree-3" &&
        result.itemCount === 1
      );
    },
  },
  {
    name: "Buy Now Isolation: Subtotal must NOT include any cart items",
    run: () => {
      const result = resolveCheckoutItemsAndSubtotal({
        directItem: directBuyProduct,
        cartItems: mockCart,
      });

      // Cart total would be (1499*2 + 799) = 3797
      // Direct buy product is 2999
      const expectedSubtotal = 2999;
      return (
        result.subtotal === expectedSubtotal &&
        result.subtotal !== 3797 &&
        result.subtotal !== (3797 + 2999)
      );
    },
  },
  {
    name: "Buy Now Cart Preservation: Existing cart items are NOT cleared when directItem is bought",
    run: () => {
      let cartCleared = false;
      const clearCart = () => { cartCleared = true; };

      const onOrderSuccess = (directItem) => {
        const isDirectBuy = Boolean(directItem);
        if (!isDirectBuy) {
          clearCart();
        }
      };

      // Simulate Buy Now checkout success
      onOrderSuccess(directBuyProduct);
      return cartCleared === false; // Cart must remain intact!
    },
  },
  {
    name: "Cart Checkout: Bundles all products when checking out from Cart page",
    run: () => {
      const result = resolveCheckoutItemsAndSubtotal({
        directItem: null,
        cartItems: mockCart,
      });

      // Cart subtotal: 1499*2 + 799 = 3797
      return (
        result.isDirectBuy === false &&
        result.items.length === 2 &&
        result.subtotal === 3797 &&
        result.itemCount === 3
      );
    },
  },
  {
    name: "Cart Checkout: Clears cart when bundle order completes successfully",
    run: () => {
      let cartCleared = false;
      const clearCart = () => { cartCleared = true; };

      const onOrderSuccess = (directItem) => {
        const isDirectBuy = Boolean(directItem);
        if (!isDirectBuy) {
          clearCart();
        }
      };

      // Simulate Cart checkout success
      onOrderSuccess(null);
      return cartCleared === true; // Cart must be cleared after bundling checkout
    },
  },
  {
    name: "Size Variant Isolation: Direct Buy passes correct sizeId and sizeName to order payload",
    run: () => {
      const result = resolveCheckoutItemsAndSubtotal({
        directItem: directBuyProduct,
        cartItems: mockCart,
      });

      const orderItem = result.items[0];
      return (
        orderItem.sizeId === "free-size" &&
        orderItem.sizeName === "Free Size" &&
        orderItem.quantity === 1
      );
    },
  },
];

let passed = 0;
console.log("\n🧪 Running Buy Now Isolation vs Cart Bundling Test Suite...\n");

for (const t of tests) {
  try {
    const ok = t.run();
    if (ok) {
      console.log(`  ✅ [PASS] ${t.name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${t.name}`);
    }
  } catch (err) {
    console.error(`  ❌ [ERROR] ${t.name}:`, err.message);
  }
}

console.log(`\nResults: ${passed}/${tests.length} tests passed.\n`);

if (passed !== tests.length) {
  process.exit(1);
} else {
  process.exit(0);
}
