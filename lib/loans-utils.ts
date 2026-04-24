import type { Loan, LoanStatus } from "@/types/loan";

export function fmt(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString()}`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-RW", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-RW", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysUntil(iso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
}

export function progressPercent(loan: Loan): number {
  const total = loan.principal + (loan.principal * loan.interestRate) / 100;
  return Math.min(100, Math.round((loan.amountPaid / total) * 100));
}

export function totalOwed(loan: Loan): number {
  return loan.principal + (loan.principal * loan.interestRate) / 100;
}

export function remaining(loan: Loan): number {
  return Math.max(0, totalOwed(loan) - loan.amountPaid);
}

export function statusLabel(status: LoanStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "OVERDUE":
      return "Overdue";
    case "PAID":
      return "Paid";
    case "PENDING_APPROVAL":
      return "Pending";
  }
}

export function statusColors(status: LoanStatus) {
  switch (status) {
    case "ACTIVE":
      return { badge: "bg-primary/10 text-primary", dot: "bg-primary" };
    case "OVERDUE":
      return {
        badge: "bg-destructive/10 text-destructive",
        dot: "bg-destructive",
      };
    case "PAID":
      return { badge: "bg-green-500/10 text-green-600", dot: "bg-green-500" };
    case "PENDING_APPROVAL":
      return { badge: "bg-warning/10 text-warning", dot: "bg-warning" };
  }
}
