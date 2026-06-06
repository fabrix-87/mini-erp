// lib/stores/breadcrumb-store.ts

import { BreadcrumbItem, BreadcrumbState } from "@/types/breadcrumb-types";

// ============================================================================
// Store — vanilla pub/sub, no external deps
// ============================================================================

type Listener = () => void;

let state: BreadcrumbState = { items: [], pathname: "" };
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((fn) => fn());
}

export const breadcrumbStore = {
  /** Subscribe — required by useSyncExternalStore */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Snapshot — required by useSyncExternalStore */
  getSnapshot(): BreadcrumbState {
    return state;
  },

  /** Server snapshot — returns empty items (SSR safe) */
  getServerSnapshot(): BreadcrumbState {
    return { items: [], pathname: "" };
  },

  /** Set a full items array */
  setItems(items: BreadcrumbItem[], pathname: string): void {
    state = { items, pathname };
    emit();
  },

  /** Reset to empty */
  clear(): void {
    state = { items: [], pathname: "" };
    emit();
  },
};
