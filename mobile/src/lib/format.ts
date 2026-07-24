export function formatCurrency(amount: number): string {
  return `₵${Math.round(amount).toLocaleString("en-US")}`;
}

export function formatCurrencyPerUnit(amount: number, unit: string): string {
  return `${formatCurrency(amount)} / ${unit}`;
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function pluralizeUnit(unit: string, qty: number = 2): string {
  if (!unit) return "";
  const trimmed = unit.trim();
  const endsWithS = trimmed.toLowerCase().endsWith("s");
  if (qty === 1) {
    // If it ends with 's', remove it to make it singular (e.g. bags -> bag)
    return endsWithS ? trimmed.slice(0, -1) : trimmed;
  }
  // If count is not 1, make it plural if it doesn't already end with 's'
  return endsWithS ? trimmed : `${trimmed}s`;
}

export function formatQtyRange(minQty: number, maxQty: number | null, unit: string): string {
  const unitLabel = formatQtyRangeLabel(minQty, maxQty, unit);
  if (maxQty === null) return `${minQty.toLocaleString()}+ ${unitLabel}`;
  return `${minQty.toLocaleString()} – ${maxQty.toLocaleString()} ${unitLabel}`;
}

function formatQtyRangeLabel(minQty: number, maxQty: number | null, unit: string): string {
  const qty = minQty === 1 && maxQty === 1 ? 1 : 2;
  return pluralizeUnit(unit, qty);
}
