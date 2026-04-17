"use client";

import { mockUser } from "@/lib/Mockdata";
import { StatsCards } from "@/components/dashboard/Statscards";
import { RecentActivity } from "@/components/dashboard/Recentactivity";
import { Schedule } from "@/components/dashboard/Schedule";
import { CalendarWidget } from "@/components/dashboard/Calendarwidget";
import { MyGroups } from "@/components/dashboard/Mygroups";

// Greeting helper 
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(fullName: string) {
  return fullName.split(" ")[0];
}

// Dashboard Page 
export default function DashboardPage() {
  return (
    <div
      className="min-h-screen w-full px-4 md:px-8 py-8 transition-colors duration-180"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="max-w-350 mx-auto flex flex-col gap-8">

        {/* Welcome Banner  */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              {getGreeting()} 👋
            </p>
            <h1
              className="font-playfair text-3xl md:text-4xl font-bold tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              Welcome back,{" "}
              <span style={{ color: "var(--color-primary)" }}>
                {getFirstName(mockUser.fullName)}
              </span>
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              Here&apos;s what&apos;s happening in your groups today.
            </p>
          </div>

          {/* Today's date pill */}
          <div
            className="px-4 py-2 rounded-(--radius-sm) text-sm font-medium"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Stats  */}
        <StatsCards />

        {/*  Main Grid: Activity + Schedule | Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <RecentActivity />
            <Schedule />
          </div>

          {/* Right col: Calendar */}
          <div className="lg:col-span-1">
            <CalendarWidget />
          </div>
        </div>

        {/*  My Groups (full width) */}
        <MyGroups />

      </div>
    </div>
  );
}