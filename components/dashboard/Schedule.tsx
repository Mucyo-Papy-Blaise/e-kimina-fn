"use client";

import { Clock, ArrowRight } from "lucide-react";
import { mockSchedule } from "@/lib/Mockdata";

const typeColors: Record<string, string> = {
  Meeting: "var(--color-primary)",
  Workshop: "var(--color-accent)",
  Session: "var(--color-primary)",
  Planning: "var(--color-accent)",
  Practice: "var(--color-primary)",
};

// Group events by day
function groupByDay(events: typeof mockSchedule) {
  return events.reduce<Record<string, typeof mockSchedule>>((acc, ev) => {
    if (!acc[ev.day]) acc[ev.day] = [];
    acc[ev.day].push(ev);
    return acc;
  }, {});
}

export function Schedule() {
  const grouped = groupByDay(mockSchedule);

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
          Schedule
        </h2>
        <button
          className="text-xs font-semibold transition-colors duration-[180ms] hover:opacity-70"
          style={{ color: "var(--color-primary)" }}
        >
          View All
        </button>
      </div>

      {/* Days */}
      <div className="flex flex-col gap-5">
        {Object.entries(grouped).map(([day, events]) => (
          <div key={day} className="flex flex-col gap-2">
            {/* Day label */}
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}
            >
              {day}
            </p>

            {/* Events */}
            <div className="flex flex-col gap-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group flex items-center gap-3 rounded-[var(--radius-sm)] p-3 transition-all duration-[180ms] hover:scale-[1.01] cursor-pointer"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {/* Color bar */}
                  <div
                    className="w-1 self-stretch rounded-full shrink-0"
                    style={{
                      background: typeColors[event.type] ?? "var(--color-primary)",
                    }}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--color-text)" }}
                    >
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          background:
                            event.color === "primary"
                              ? "var(--color-primary-soft)"
                              : "var(--color-accent-soft)",
                          color:
                            event.color === "primary"
                              ? "var(--color-primary)"
                              : "var(--color-accent)",
                        }}
                      >
                        {event.type}
                      </span>
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        <Clock size={10} />
                        {event.time} · {event.duration}
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    size={14}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[180ms]"
                    style={{ color: "var(--color-text-muted)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}