/**
 * Central config re-export.
 * Every component imports from here: `import { config } from "@/lib/config"`
 */
import siteConfig from "../../site.config";

export const config = siteConfig;

/** Format a price using the configured currency and locale */
export function formatPrice(amount: number): string {
  const currency = config.pricing?.currency || "₹";
  const locale = config.pricing?.locale || "en-IN";
  return `${currency}${amount.toLocaleString(locale)}`;
}
