import { PageHeader } from "@/components/dashboard/page-header";

type DashboardStubProps = {
  title: string;
  description?: string;
};

export function DashboardStub({ title, description }: DashboardStubProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="rounded-[var(--radius)] border border-border bg-secondary p-8 text-center text-sm text-text-muted shadow-[var(--shadow-md)]">
        Content coming soon.
      </div>
    </div>
  );
}
