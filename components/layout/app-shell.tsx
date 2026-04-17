"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardTopBar } from "@/components/layout/dashboard-top-bar";
import { useAuth } from "@/lib/auth/auth-context";
import { useClientMounted } from "@/lib/auth/use-client-mounted";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const mounted = useClientMounted();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return (
      <div className="bg-bg flex min-h-screen items-center justify-center text-text">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-bg flex min-h-screen text-text">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <DashboardTopBar />
        <main className="min-h-0 flex-1 overflow-auto p-page">{children}</main>
      </div>
    </div>
  );
}
