"use client";

import { useEffect, useState } from "react";

/** True only after the first client paint — avoids SSR/hydration mismatch with `localStorage` and auth. */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
