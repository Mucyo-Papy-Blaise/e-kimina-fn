import { Separator } from "@/components/ui/separator";

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <Separator className="flex-1 bg-border" />
      <span className="text-xs font-medium text-text-muted">Or</span>
      <Separator className="flex-1 bg-border" />
    </div>
  );
}
