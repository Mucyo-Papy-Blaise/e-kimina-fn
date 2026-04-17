"use client";

import { useQuery } from "@tanstack/react-query";

type ProjectStatus = {
  framework: string;
  runtime: string;
  language: string;
  queryLibrary: string;
  generatedAt: string;
};

async function getProjectStatus(): Promise<ProjectStatus> {
  const response = await fetch("/api/status");

  if (!response.ok) {
    throw new Error("Failed to load project status.");
  }

  return response.json();
}

export function StatusCard() {
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["project-status"],
    queryFn: getProjectStatus,
  });

  return (
    <section className="w-full rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-700">
              React Query
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Client data is wired and cached
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-500 hover:text-sky-700"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <p className="text-slate-600">Loading project status...</p>
        ) : null}

        {error instanceof Error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error.message}
          </p>
        ) : null}

        {data ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm text-slate-500">Framework</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">
                {data.framework}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm text-slate-500">Language</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">
                {data.language}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm text-slate-500">Runtime</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">
                {data.runtime}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm text-slate-500">Query library</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">
                {data.queryLibrary}
              </dd>
            </div>
          </dl>
        ) : null}

        {data ? (
          <p className="text-sm text-slate-500">
            Last response: {new Date(data.generatedAt).toLocaleString()}
            {isFetching ? " · refreshing..." : ""}
          </p>
        ) : null}
      </div>
    </section>
  );
}
