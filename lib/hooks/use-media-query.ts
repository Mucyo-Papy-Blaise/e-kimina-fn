"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, onStoreChange: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches;
}

/**
 * Subscribes to `window.matchMedia`. Server snapshot is `false` (mobile-first).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => subscribe(query, onChange),
    () => getSnapshot(query),
    () => false,
  );
}
