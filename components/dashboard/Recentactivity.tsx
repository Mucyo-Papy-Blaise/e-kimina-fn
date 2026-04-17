"use client";

import {
  UserPlus,
  Calendar,
  MessageSquare,
  RefreshCw,
  Award,
  CheckCircle2,
} from "lucide-react";
import { mockActivities} from "@/lib/Mockdata";

const iconMap: Record<string, React.ReactNode> = {
  "user-plus": <UserPlus size={15} />,
  calendar: <Calendar size={15} />,
  message: <MessageSquare size={15} />,
  refresh: <RefreshCw size={15} />,
  award: <Award size={15} />,
  check: <CheckCircle2 size={15} />,
};

export function RecentActivity() {
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
          Recent Activity
        </h2>
        <button
          className="text-xs font-semibold transition-colors duration-[180ms] hover:opacity-70"
          style={{ color: "var(--color-primary)" }}
        >
          View All
        </button>
      </div>

      {/* Activity list */}
      <div className="flex flex-col">
        {mockActivities.map((activity, i) => (
          <div key={activity.id}>
            <div className="flex items-start gap-3 py-3">
              {/* Icon bubble */}
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                style={{
                  background:
                    activity.color === "primary"
                      ? "var(--color-primary-soft)"
                      : "var(--color-accent-soft)",
                  color:
                    activity.color === "primary"
                      ? "var(--color-primary)"
                      : "var(--color-accent)",
                }}
              >
                {iconMap[activity.icon]}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm leading-snug"
                  style={{ color: "var(--color-text)" }}
                >
                  {activity.description}{" "}
                  <span
                    className="font-semibold"
                    style={{
                      color:
                        activity.color === "primary"
                          ? "var(--color-primary)"
                          : "var(--color-accent)",
                    }}
                  >
                    {activity.target}
                  </span>
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {activity.time}
                </p>
              </div>
            </div>

            {/* Divider — skip last */}
            {i < mockActivities.length - 1 && (
              <div
                className="h-px ml-11"
                style={{ background: "var(--color-border)" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
