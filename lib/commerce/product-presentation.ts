type StockInput = { stock: number };

export function getProductAvailability(variants: StockInput[]) {
  const totalStock = variants.reduce((total, variant) => total + variant.stock, 0);

  if (totalStock <= 0) {
    return {
      label: "Sold out",
      tone: "sold-out" as const,
      totalStock
    };
  }

  if (totalStock <= 3) {
    return {
      label: `Low stock: ${totalStock} left`,
      tone: "low-stock" as const,
      totalStock
    };
  }

  return {
    label: `${totalStock} pieces available`,
    tone: "available" as const,
    totalStock
  };
}

export function normalizeProductMediaInput(media: string[]) {
  return media.map((item) => item.trim()).filter(Boolean);
}
