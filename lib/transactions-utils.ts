import type { TransactionType } from "@/types/transactions";

// ── Formatting ────────────────────────────────────────────────

export function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-RW", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-RW", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Labels ────────────────────────────────────────────────────

export function txTypeLabel(type: TransactionType): string {
  switch (type) {
    case "CONTRIBUTION":
      return "Contribution";
    case "LOAN_REPAYMENT":
      return "Loan Repayment";
    case "PENALTY":
      return "Penalty";
    case "DEPOSIT":
      return "Deposit";
  }
}

// ── Date helpers ──────────────────────────────────────────────

/** Returns the number of whole days until a date (negative = overdue). */
export function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
}

/** Human-readable countdown string: "3 days left", "Due today", "2 days overdue" */
export function countdownLabel(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0)
    return `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`;
  if (days === 0) return "Due today";
  return `${days} day${days !== 1 ? "s" : ""} left`;
}

// ── Grouping ──────────────────────────────────────────────────

/** Groups an array of items by their formatted date label (for date-section headers). */
export function groupByDate<T extends { date: string }>(
  items: T[],
): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = formatDate(item.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries());
}
