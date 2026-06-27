// Product quantity rules for minimum orders and pack sizes
export interface ProductQuantityRule {
  productType: string;
  minimumQuantity: number;
  stepSize: number;
  description: string;
}

export const PRODUCT_QUANTITY_RULES: Record<string, ProductQuantityRule> = {
  flag: {
    productType: "flag",
    minimumQuantity: 1,
    stepSize: 1,
    description: "Individual flags",
  },
  "water-bottle": {
    productType: "water-bottle",
    minimumQuantity: 1,
    stepSize: 1,
    description: "Individual bottles",
  },
  "key-holder": {
    productType: "key-holder",
    minimumQuantity: 3,
    stepSize: 3,
    description: "Sold in sets of 3",
  },
  wristband: {
    productType: "wristband",
    minimumQuantity: 5,
    stepSize: 5,
    description: "Sold in sets of 5",
  },
  "packaging-bag": {
    productType: "packaging-bag",
    minimumQuantity: 5,
    stepSize: 5,
    description: "Sold in sets of 5",
  },
  "ticketing-band": {
    productType: "ticketing-band",
    minimumQuantity: 25,
    stepSize: 25,
    description: "Sold in sets of 25",
  },
  "business-card": {
    productType: "business-card",
    minimumQuantity: 20,
    stepSize: 20,
    description: "Sold in sets of 20",
  },
  "teardrop-banner": {
    productType: "teardrop-banner",
    minimumQuantity: 3,
    stepSize: 3,
    description: "Sold in sets of 3",
  },
};

/**
 * Get quantity rule for a specific product type
 */
export const getProductQuantityRule = (productType: string): ProductQuantityRule | null => {
  return PRODUCT_QUANTITY_RULES[productType] || null;
};

/**
 * Check if a quantity is valid for a product type
 */
export const isValidQuantity = (productType: string, quantity: number): boolean => {
  const rule = getProductQuantityRule(productType);
  if (!rule) return true; // No rule means any quantity is valid

  return quantity >= rule.minimumQuantity && quantity % rule.stepSize === 0;
};

/**
 * Round up quantity to the nearest valid step for a product type
 */
export const roundUpToValidQuantity = (productType: string, quantity: number): number => {
  const rule = getProductQuantityRule(productType);
  if (!rule) return Math.max(1, quantity);

  // Ensure minimum quantity
  if (quantity < rule.minimumQuantity) {
    return rule.minimumQuantity;
  }

  // Round up to nearest step
  return Math.ceil(quantity / rule.stepSize) * rule.stepSize;
};

/**
 * Get the effective minimum quantity considering both product rules and manufacturer minimums
 */
export const getEffectiveMinimum = (productType: string, manufacturerMinimum: number): number => {
  const rule = getProductQuantityRule(productType);
  if (!rule) return manufacturerMinimum;

  // Find the smallest valid quantity that meets both requirements
  const baseMinimum = Math.max(rule.minimumQuantity, manufacturerMinimum);
  return roundUpToValidQuantity(productType, baseMinimum);
};
