"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

export function AuthStatus() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
        Checking session…
      </p>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Signed in as <span className="font-semibold">{user.fullName}</span> ({user.email}) —{" "}
          <Link href="/dashboard" className="font-semibold text-sky-800 underline-offset-4 hover:underline">
            Open dashboard
          </Link>
        </p>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-500 hover:text-sky-800"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <p className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
      <Link href="/login" className="font-semibold text-sky-800 underline-offset-4 hover:underline">
        Sign in
      </Link>{" "}
      or{" "}
      <Link href="/register" className="font-semibold text-sky-800 underline-offset-4 hover:underline">
        create an account
      </Link>{" "}
      to load your profile from <code className="text-xs">GET /api/auth/profile</code>.
    </p>
  );
}
