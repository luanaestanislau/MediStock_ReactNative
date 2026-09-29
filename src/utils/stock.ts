import type { NivelUi, StockItemUi } from "../types/ui";

export type StockFilter = "todos" | NivelUi;

export function filterStock(
  items: StockItemUi[],
  filter: StockFilter,
  query: string,
): StockItemUi[] {
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const q = normalize(query.trim());

  return items.filter((item) => {
    if (filter !== "todos" && item.status !== filter) return false;
    if (!q) return true;
    return [item.nome, item.localArmazenamento, item.hospitalNome].some(
      (field) => normalize(field ?? "").includes(q),
    );
  });
}

export function currentMonth(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export function isValidMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}
