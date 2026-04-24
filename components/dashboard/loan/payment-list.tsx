"use client";

import type { LoanPayment } from "@/types/loan";
import { fmt, fmtDateTime } from "@/lib/loans-utils";
import { cn } from "@/utils/cn";

type Props = {
  payments: LoanPayment[];
};

function PaymentStatusBadge({ status }: { status: LoanPayment["status"] }) {
  const map: Record<
    LoanPayment["status"],
    { label: string; className: string }
  > = {
    COMPLETED: {
      label: "On time",
      className: "bg-green-500/10 text-green-600",
    },
    LATE: {
      label: "Late",
      className: "bg-destructive/10 text-destructive",
    },
    MISSED: {
      label: "Missed",
      className: "bg-destructive/10 text-destructive",
    },
  };
  const { label, className } = map[status];
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}

function PaymentIcon({ status }: { status: LoanPayment["status"] }) {
  const isLate = status === "LATE" || status === "MISSED";
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        isLate ? "bg-destructive/10" : "bg-green-500/10",
      )}
    >
      {isLate ? (
        <svg
          className="h-4 w-4 text-destructive"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle
            cx="8"
            cy="8"
            r="6.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M8 4.5V8l2.5 1.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg className="h-4 w-4 text-green-600" viewBox="0 0 16 16" fill="none">
          <circle
            cx="8"
            cy="8"
            r="6.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M5 8.5l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

export function PaymentList({ payments }: Props) {
  if (payments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        No payments recorded yet.
      </p>
    );
  }

  const sorted = [...payments].sort(
    (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
  );

  return (
    <div className="space-y-2">
      {sorted.map((payment) => (
        <div
          key={payment.id}
          className="flex items-center gap-3 rounded-(--radius) border border-border bg-bg p-3.5"
        >
          <PaymentIcon status={payment.status} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-text">
                {payment.groupName} — Instalment {payment.installmentNumber}
              </p>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <p className="mt-0.5 text-xs text-text-muted">
              {fmtDateTime(payment.paidAt)}
              {payment.note && (
                <span className="ml-1.5 italic">&middot; {payment.note}</span>
              )}
            </p>
          </div>

          <div className="text-right">
            <p
              className={cn(
                "tabular-nums text-sm font-bold",
                payment.status === "COMPLETED"
                  ? "text-green-600"
                  : "text-destructive",
              )}
            >
              +{fmt(payment.amount, payment.currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
