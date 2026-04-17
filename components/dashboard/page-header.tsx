type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6 sm:mb-8">
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
