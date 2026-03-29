// lib/stores/breadcrumb-store.ts

// ============================================================================
// Types
// ============================================================================

export interface BreadcrumbItem {
  /** Visible label */
  label: string;
  /** Optional link — last item is typically not linked */
  href?: string;
}

interface BreadcrumbState {
  items: BreadcrumbItem[];
}

// ============================================================================
// Store — vanilla pub/sub, no external deps
// ============================================================================

type Listener = () => void;

let state: BreadcrumbState = { items: [] };
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
    return { items: [] };
  },

  /** Set a full items array */
  setItems(items: BreadcrumbItem[]): void {
    state = { items };
    emit();
  },

  /** Reset to empty */
  clear(): void {
    state = { items: [] };
    emit();
  },
};
