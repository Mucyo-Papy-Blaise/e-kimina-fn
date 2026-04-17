"use client";

import { TrendingUp, Users, Zap, Calendar, MessageSquare } from "lucide-react";
import { mockStats } from "@/lib/Mockdata";

const iconMap: Record<string, React.ReactNode> = {
  users: <Users size={20} />,
  zap: <Zap size={20} />,
  calendar: <Calendar size={20} />,
  message: <MessageSquare size={20} />,
};

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {mockStats.map((stat, i) => (
        <div
          key={stat.id}
          className="relative rounded-[var(--radius)] p-5 overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
            animationDelay: `${i * 80}ms`,
          }}
        >
          {/* Accent glow */}
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 transition-all duration-300 group-hover:scale-125"
            style={{
              background:
                stat.accent === "primary"
                  ? "var(--color-primary-soft)"
                  : "var(--color-accent-soft)",
            }}
          />

          {/* Icon */}
          <div
            className="relative z-10 w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center mb-4"
            style={{
              background:
                stat.accent === "primary"
                  ? "var(--color-primary-soft)"
                  : "var(--color-accent-soft)",
              color:
                stat.accent === "primary"
                  ? "var(--color-primary)"
                  : "var(--color-accent)",
            }}
          >
            {iconMap[stat.icon]}
          </div>

          {/* Value */}
          <div className="relative z-10">
            <p
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              {stat.value}
            </p>
            <p
              className="text-sm font-medium mt-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              {stat.label}
            </p>
          </div>

          {/* Trend */}
          <div className="relative z-10 flex items-center gap-1 mt-3">
            {stat.trend === "up" && (
              <TrendingUp
                size={12}
                style={{ color: "var(--color-primary)" }}
              />
            )}
            <span
              className="text-xs font-medium"
              style={{
                color:
                  stat.trend === "up"
                    ? "var(--color-primary)"
                    : "var(--color-text-muted)",
              }}
            >
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}