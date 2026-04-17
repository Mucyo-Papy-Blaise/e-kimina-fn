"use client";

import { useSyncExternalStore } from "react";
import { TOKEN_EVENT, tokenStorage } from "@/lib/api/api-client";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(TOKEN_EVENT, handler);
  return () => window.removeEventListener(TOKEN_EVENT, handler);
}

function getSnapshot() {
  return !!tokenStorage.get();
}

function getServerSnapshot() {
  return false;
}

/** True when a JWT is stored (client-only). */
export function useHasStoredToken(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
