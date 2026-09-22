export interface PricingBreakdown {
  basePrice: number;
  printingSurcharge: number;
  quantityDiscount: number;
  designCoverageAdjustment: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface PricingResult {
  breakdown: PricingBreakdown;
  currency: string;
}

// Base unit prices in KSh
const BASE_PRICES: Record<string, number> = {
  "t-shirt": 800,
  hoodie: 2000,
  cap: 600,
  apron: 700,
  scrubs: 1200,
  jumpsuit: 2000,
  "long-sleeve": 900,
  "tank-top": 700,
  flag: 5000,
  "water-bottle": 1200,
  "key-holder": 200,
  wristband: 50,
  "packaging-bag": 200,
  "ticketing-band": 150,
  "business-card": 100,
  "teardrop-banner": 1500,
  poster: 2000,
  mug: 200,
  "tote-bag": 700,
  "advertising-banner": 25000,
  general: 500,
};

// Printing method surcharge, as a percentage of the item's base price
// (previously a fixed KSh amount per unit).
const PRINTING_SURCHARGE_RATES: Record<string, number> = {
  DTG: 0.5,
  "No Cut": 0.25,
  Embroidery: 0.5,
};

// Quantity discount tiers
const QUANTITY_DISCOUNTS = [
  { min: 200, discount: 0.15 }, // 15% off for 200+
  { min: 100, discount: 0.12 }, // 12% off for 100+
  { min: 50, discount: 0.1 }, // 10% off for 50+
  { min: 25, discount: 0.07 }, // 7% off for 25+
  { min: 10, discount: 0.05 }, // 5% off for 10+
];

// Design coverage adjustments
const DESIGN_COVERAGE_ADJUSTMENTS: Record<string, number> = {
  small: 0, // 0% adjustment
  medium: 0.05, // 5% increase
  large: 0.1, // 10% increase
};

export function calculatePricing(
  productType: string,
  printingMethod: string,
  quantity: number,
  designCoverage: "small" | "medium" | "large" = "small",
): PricingResult {
  // Get base price
  const baseUnitPrice = BASE_PRICES[productType] || BASE_PRICES["t-shirt"];
  const basePrice = baseUnitPrice * quantity;

  // Get printing surcharge - a percentage of the base price, not a fixed
  // per-unit amount (e.g. No Cut = 25% of the item price, DTG/Embroidery
  // = 50%).
  const printingSurchargeRate = PRINTING_SURCHARGE_RATES[printingMethod] || 0;
  const printingSurcharge = basePrice * printingSurchargeRate;

  // Calculate quantity discount
  let discountRate = 0;
  for (const tier of QUANTITY_DISCOUNTS) {
    if (quantity >= tier.min) {
      discountRate = tier.discount;
      break;
    }
  }
  const quantityDiscount = -(basePrice + printingSurcharge) * discountRate;

  // Calculate design coverage adjustment
  const coverageRate = DESIGN_COVERAGE_ADJUSTMENTS[designCoverage];
  const designCoverageAdjustment = (basePrice + printingSurcharge) * coverageRate;

  // Calculate subtotal
  const subtotal = basePrice + printingSurcharge + quantityDiscount + designCoverageAdjustment;

  // Tax and shipping (currently 0)
  const tax = 0;
  const shipping = 0;

  // Calculate total
  const total = subtotal + tax + shipping;

  return {
    breakdown: {
      basePrice,
      printingSurcharge,
      quantityDiscount,
      designCoverageAdjustment,
      subtotal,
      tax,
      shipping,
      total,
    },
    currency: "KSh",
  };
}

// Convert KSh to cents for database storage
export function kshToCents(ksh: number): number {
  return Math.round(ksh * 100);
}

// Convert cents to KSh for display
export function centsToKsh(cents: number): number {
  return cents / 100;
}

// Format currency for display
export function formatKsh(amount: number): string {
  return `KSh ${amount.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
