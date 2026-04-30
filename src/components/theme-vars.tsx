"use client";

import { config } from "@/lib/config";

/**
 * Injects CSS custom properties from site.config.ts into :root.
 * This makes the brand colors configurable without editing globals.css.
 * Place this inside <body> in the root layout.
 */
export function ThemeVars() {
  const { primary, primaryLight, primaryDark, background, foreground } = config.colors;
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root {
  --background: ${background};
  --foreground: ${foreground};
  --gold: ${primary};
  --gold-light: ${primaryLight};
  --gold-dark: ${primaryDark};
}`,
      }}
    />
  );
}
