/**
 * Central config re-export.
 * Every component imports from here: `import { config } from "@/lib/config"`
 */
import siteConfig from "../../site.config";

export const config = siteConfig;

/** Format a price using the configured currency and locale */
export function formatPrice(amount: number): string {
  return `${config.pricing.currency}${amount.toLocaleString(config.pricing.locale)}`;
}
