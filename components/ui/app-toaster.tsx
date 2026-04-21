"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/lib/providers/theme-provider";

export function AppToaster() {
  const { theme, mounted } = useTheme();

  return (
    <Toaster
      position="top-right"
      closeButton={false}
      expand={false}
      richColors
      theme={mounted && theme === "dark" ? "dark" : "light"}
      gap={12}
      toastOptions={{
        classNames: {
          toast:
            "group-[.toaster]:rounded-[var(--radius)] group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:bg-bg group-[.toaster]:text-text group-[.toaster]:shadow-[var(--shadow-md)]",
        },
      }}
    />
  );
}
