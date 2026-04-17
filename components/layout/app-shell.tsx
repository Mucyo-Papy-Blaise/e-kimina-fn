"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardTopBar } from "@/components/layout/dashboard-top-bar";
import { useAuth } from "@/lib/auth/auth-context";
import { useClientMounted } from "@/lib/auth/use-client-mounted";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const mounted = useClientMounted();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen || isDesktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen, isDesktop]);

  useEffect(() => {
    if (!mobileNavOpen || isDesktop) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen, isDesktop]);

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
    <div className="bg-bg flex h-dvh min-h-0 overflow-hidden text-text">
      {mobileNavOpen && !isDesktop ? (
        <button
          type="button"
          className="fixed inset-0 z-30 cursor-default bg-text/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <AppSidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <DashboardTopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="min-h-0 flex-1 overflow-auto overscroll-y-contain p-page">{children}</main>
      </div>
    </div>
  );
}
