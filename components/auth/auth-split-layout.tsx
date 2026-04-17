import type { ReactNode } from "react";

export type AuthStep = { id: string; label: string };

type AuthSplitLayoutProps = {
  title: ReactNode;
  subtitle: string;
  steps: readonly AuthStep[];
  activeStepIndex: number;
  children: ReactNode;
};

export function AuthSplitLayout({
  title,
  subtitle,
  steps,
  activeStepIndex,
  children,
}: AuthSplitLayoutProps) {
  return (
    <div className="dark flex min-h-screen w-full bg-bg text-text">
      <aside className="relative hidden w-1/2 flex-col overflow-hidden bg-secondary lg:flex">
        <div className="auth-hero-gradient pointer-events-none absolute inset-0" aria-hidden />
        <div className="auth-hero-noise pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden />

        <div className="relative z-10 flex min-h-screen flex-col justify-between p-page">
          <div className="flex flex-1 flex-col justify-center gap-6">
            <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
              <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-text md:text-5xl">
                {title}
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-text-muted">{subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-8">
            {steps.map((step, i) => {
              const active = i === activeStepIndex;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-3 rounded-xl border px-3 py-4 text-center transition-colors ${
                    active
                      ? "border-border bg-text"
                      : "border-border/60 bg-primary-soft/40"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      active ? "bg-bg text-text" : "bg-border/80 text-text-muted"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-xs leading-snug md:text-sm ${active ? "font-medium text-bg" : "text-text-muted"}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-1 flex-col justify-center overflow-y-auto bg-bg p-page">
        {children}
      </main>
    </div>
  );
}
