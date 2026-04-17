import { cn } from "@/utils/cn";

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6 sm:mb-8", className)}>
      <h1 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-text-muted sm:text-[15px]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
