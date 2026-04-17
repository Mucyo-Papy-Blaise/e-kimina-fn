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
      richColors={false}
      theme={mounted && theme === "dark" ? "dark" : "light"}
      gap={12}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "!bg-transparent !border-0 !p-0 !shadow-none",
        },
      }}
    />
  );
}
