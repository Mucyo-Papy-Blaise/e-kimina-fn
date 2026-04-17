"use client";

import { Users, ArrowRight, Crown, Shield, Star } from "lucide-react";
import { mockGroups } from "@/lib/Mockdata";

const roleIcon: Record<string, React.ReactNode> = {
  Admin: <Crown size={11} />,
  Moderator: <Shield size={11} />,
  Member: <Star size={11} />,
};

const roleColors: Record<string, string> = {
  Admin: "var(--color-accent)",
  Moderator: "var(--color-primary)",
  Member: "var(--color-text-muted)",
};

const activityDot: Record<string, string> = {
  Active: "var(--color-primary)",
  Moderate: "var(--color-accent)",
  Quiet: "var(--color-text-muted)",
};

export function MyGroups() {
  return (
    <div
      className="rounded-[var(--radius)] p-6 flex flex-col gap-5"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          className="font-bold text-base tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          My Groups
        </h2>
        <button
          className="text-xs font-semibold transition-colors duration-[180ms] hover:opacity-70"
          style={{ color: "var(--color-primary)" }}
        >
          View All
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {mockGroups.map((group) => (
          <div
            key={group.id}
            className="group relative rounded-[var(--radius-sm)] p-4 flex flex-col gap-3 cursor-pointer transition-all duration-[180ms] hover:-translate-y-0.5 hover:shadow-lg overflow-hidden"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            {/* Glow */}
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-6 translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  group.color === "primary"
                    ? "var(--color-primary-soft)"
                    : "var(--color-accent-soft)",
              }}
            />

            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background:
                    group.color === "primary"
                      ? "var(--color-primary-soft)"
                      : "var(--color-accent-soft)",
                  color:
                    group.color === "primary"
                      ? "var(--color-primary)"
                      : "var(--color-accent)",
                }}
              >
                {group.avatar}
              </div>

              {/* Role badge */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
                style={{
                  background:
                    group.role === "Admin"
                      ? "var(--color-accent-soft)"
                      : group.role === "Moderator"
                        ? "var(--color-primary-soft)"
                        : "var(--color-border)",
                  color: roleColors[group.role],
                }}
              >
                {roleIcon[group.role]}
                {group.role}
              </div>
            </div>

            {/* Info */}
            <div className="relative z-10">
              <p
                className="text-sm font-bold leading-snug"
                style={{ color: "var(--color-text)" }}
              >
                {group.name}
              </p>
              <p
                className="text-xs mt-0.5 line-clamp-2 leading-relaxed"
                style={{ color: "var(--color-text-muted)" }}
              >
                {group.description}
              </p>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                {/* Members */}
                <div
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <Users size={11} />
                  {group.members}
                </div>

                {/* Activity */}
                <div className="flex items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: activityDot[group.activity] }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {group.activity}
                  </span>
                </div>
              </div>

              <ArrowRight
                size={13}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-[180ms]"
                style={{ color: "var(--color-text-muted)" }}
              />
            </div>

            {/* Next event */}
            <div
              className="relative z-10 text-[11px] font-medium pt-2"
              style={{
                borderTop: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              Next event:{" "}
              <span
                className="font-semibold"
                style={{
                  color:
                    group.color === "primary"
                      ? "var(--color-primary)"
                      : "var(--color-accent)",
                }}
              >
                {group.nextEvent}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
