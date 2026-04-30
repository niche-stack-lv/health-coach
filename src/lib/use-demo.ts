"use client";

import { useSearchParams } from "next/navigation";

export function useIsDemo() {
  try {
    const searchParams = useSearchParams();
    return searchParams.get("demo") === "true";
  } catch {
    return false;
  }
}

export function useDemoLink(path: string) {
  const isDemo = useIsDemo();
  return isDemo ? `${path}?demo=true` : path;
}

export function useDemoSuffix() {
  const isDemo = useIsDemo();
  return isDemo ? "?demo=true" : "";
}
