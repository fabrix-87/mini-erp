"use client";

/**
 * Provides a singleton access point for URLSearchParams across the app.
 * Replaces direct useSearchParams() calls in child components to avoid
 * multiple re-render subscriptions that cause redundant server fetches.
 */
import { createContext, Suspense, useContext, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { ReadonlyURLSearchParams } from "next/navigation";

const SearchParamsContext = createContext<ReadonlyURLSearchParams | null>(null);

/**
 * Inner component that actually calls useSearchParams() — must be
 * wrapped in <Suspense> by the parent (SearchParamsProvider).
 */
function SearchParamsInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  return (
    <SearchParamsContext.Provider value={searchParams}>{children}</SearchParamsContext.Provider>
  );
}

/**
 * Singleton provider: place once at the top of the client tree (e.g. CrmLayout).
 * All descendants can call useAppSearchParams() instead of useSearchParams().
 */
export function SearchParamsProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SearchParamsInner>{children}</SearchParamsInner>
    </Suspense>
  );
}

/**
 * Returns the current URLSearchParams from the nearest SearchParamsProvider.
 * Throws if called outside of a SearchParamsProvider.
 */
export function useAppSearchParams(): ReadonlyURLSearchParams {
  const ctx = useContext(SearchParamsContext);
  if (ctx === null) {
    throw new Error("useAppSearchParams must be used within a SearchParamsProvider");
  }
  return ctx;
}
