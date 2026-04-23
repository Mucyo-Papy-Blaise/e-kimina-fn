"use client";

import { useState } from "react";
import { BadgePercent, CreditCard, Settings2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { LoanSettingsTab } from "./Loan-settings-tab";
import { ContributionSettingsForm } from "./Contribution-settings-form";

type SettingsSection = "contribution" | "loan";

type NavItem = {
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "contribution",
    label: "Contributions",
    description: "Amount, schedule & rules",
    icon: CreditCard,
  },
  {
    id: "loan",
    label: "Loans",
    description: "Interest, limits & penalties",
    icon: BadgePercent,
  },
];

type SettingsTabProps = {
  groupId: string;
  isVerified: boolean;
  canEdit: boolean;
};

export function SettingsTab({
  groupId,
  isVerified,
  canEdit,
}: SettingsTabProps) {
  const [active, setActive] = useState<SettingsSection>("contribution");

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* ── Sidebar nav ─────────────────────────────────────────── */}
      <aside className="w-full shrink-0 lg:w-56 xl:w-64">
        {/* Mobile: horizontal scrollable pill nav */}
        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-(--radius) border px-4 py-2.5 text-sm font-medium transition-colors",
                  active === item.id
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-secondary text-text-muted hover:bg-secondary-2 hover:text-text",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Desktop: vertical stacked nav */}
        <nav className="hidden lg:flex lg:flex-col lg:gap-1">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
            <Settings2 className="size-3.5" />
            Group settings
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-(--radius) border px-3 py-3 text-left transition-colors",
                  isActive
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-transparent text-text-muted hover:border-border hover:bg-secondary hover:text-text",
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    isActive ? "text-primary" : "text-text-muted",
                  )}
                />
                <span>
                  <span className="block text-sm font-medium leading-tight">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-text-muted">
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Content panel ───────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        {active === "contribution" && (
          <ContributionSettingsForm
            groupId={groupId}
            isVerified={isVerified}
            canEdit={canEdit}
          />
        )}
        {active === "loan" && (
          <LoanSettingsTab
            groupId={groupId}
            isVerified={isVerified}
            canEdit={canEdit}
          />
        )}
      </div>
    </div>
  );
}
