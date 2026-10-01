/** Application-wide constants */

/** Responsive breakpoints (match Tailwind defaults) */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/** Product grid column counts per breakpoint */
export const GRID_COLS = {
  mobile: 2,
  tablet: 3,
  desktop: 4,
  wide: 5,
} as const;

/** Default pagination */
export const PAGE_SIZE = 12;

/** Image aspect ratios for consistent product presentation */
export const IMAGE_RATIOS = {
  product: 3 / 4,      // Portrait – best for clothing
  category: 1,          // Square – thumbnails / circles
  hero: 16 / 9,
  editorial: 4 / 5,
} as const;

/** Animation durations (ms) */
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

/** Currency formatting */
export const formatPrice = (amount: number, locale = "en-IN", currency = "INR"): string =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/** Discount percentage calculation */
export const getDiscountPercentage = (price: number, compareAtPrice: number): number =>
  Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
