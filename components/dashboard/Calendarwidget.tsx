"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mockCalendarEvents } from "@/lib/Mockdata";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarWidget() {
  const today = new Date();
  const [current, setCurrent] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  const daysInMonth = getDaysInMonth(current.year, current.month);
  const firstDay = getFirstDayOfMonth(current.year, current.month);

  const prev = () =>
    setCurrent((c) =>
      c.month === 0
        ? { month: 11, year: c.year - 1 }
        : { month: c.month - 1, year: c.year },
    );

  const next = () =>
    setCurrent((c) =>
      c.month === 11
        ? { month: 0, year: c.year + 1 }
        : { month: c.month + 1, year: c.year },
    );

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isToday = (d: number) =>
    d === today.getDate() &&
    current.month === today.getMonth() &&
    current.year === today.getFullYear();

  const hasEvent = (d: number) => !!mockCalendarEvents[d];

  return (
    <div
      className="rounded-[var(--radius)] p-6 flex flex-col gap-4"
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
          Calendar
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-[180ms] hover:bg-[var(--color-surface-2)]"
            style={{ color: "var(--color-text-muted)" }}
          >
            <ChevronLeft size={14} />
          </button>
          <span
            className="text-sm font-semibold tabular-nums min-w-[110px] text-center"
            style={{ color: "var(--color-text)" }}
          >
            {MONTHS[current.month]} {current.year}
          </span>
          <button
            onClick={next}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-[180ms] hover:bg-[var(--color-surface-2)]"
            style={{ color: "var(--color-text-muted)" }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-[11px] font-bold uppercase tracking-wide py-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            {day ? (
              <>
                <button
                  className="w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition-all duration-[180ms] hover:bg-[var(--color-primary-soft)]"
                  style={{
                    background: isToday(day)
                      ? "var(--color-primary)"
                      : "transparent",
                    color: isToday(day) ? "#0f172a" : "var(--color-text)",
                    fontWeight: isToday(day) ? 700 : 400,
                  }}
                >
                  {day}
                </button>
                {/* Event dots */}
                <div className="flex gap-0.5 h-1.5">
                  {(mockCalendarEvents[day] ?? []).slice(0, 2).map((ev, j) => (
                    <div
                      key={j}
                      className="w-1 h-1 rounded-full"
                      style={{
                        background:
                          ev.color === "primary"
                            ? "var(--color-primary)"
                            : "var(--color-accent)",
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
        ))}
      </div>

      {/* Upcoming event preview */}
      {mockCalendarEvents[today.getDate()] && (
        <div
          className="rounded-[var(--radius-sm)] p-3 mt-1"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p
            className="text-xs font-bold mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            TODAY
          </p>
          <div className="flex flex-col gap-1">
            {mockCalendarEvents[today.getDate()].map((ev, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background:
                      ev.color === "primary"
                        ? "var(--color-primary)"
                        : "var(--color-accent)",
                  }}
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {ev.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
