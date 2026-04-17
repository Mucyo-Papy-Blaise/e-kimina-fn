import { AuthStatus } from "../components/auth-status";
import { StatusCard } from "../components/status-card";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe,#fff7ed_45%,#f8fafc_100%)] p-page text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <AuthStatus />

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
              E-Kimina starter
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                Next.js 16, TypeScript, and TanStack React Query are ready.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                The app router is set up, a shared query client is mounted in
                the root layout, and the example below fetches data from a local
                API route with caching and refetch support.
              </p>
            </div>
          </div>

          <div className="rounded-4xl bg-slate-950 p-6 text-slate-50 shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300">
              Installed stack
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>`next@16.2.4` with the App Router</li>
              <li>`typescript@5` and generated route types</li>
              <li>`@tanstack/react-query@5` with Devtools</li>
            </ul>
          </div>
        </section>

        <StatusCard />
      </div>
    </main>
  );
}
