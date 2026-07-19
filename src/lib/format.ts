export function formatCurrency(amount: number): string {
  return `₵${Math.round(amount).toLocaleString("en-US")}`;
}

export function formatCurrencyPerUnit(amount: number, unit: string): string {
  return `${formatCurrency(amount)} / ${unit}`;
}

export function formatQtyRange(minQty: number, maxQty: number | null, unit: string): string {
  const unitLabel = minQty === 1 && maxQty === 1 ? unit : `${unit}s`;
  if (maxQty === null) return `${minQty.toLocaleString()}+ ${unitLabel}`;
  return `${minQty.toLocaleString()} – ${maxQty.toLocaleString()} ${unitLabel}`;
}
