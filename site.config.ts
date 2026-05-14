/**
 * ═══════════════════════════════════════════════════════════════
 * SITE CONFIGURATION LOADER
 * ═══════════════════════════════════════════════════════════════
 *
 * This file dynamically loads the correct client config based on
 * the CLIENT_ID environment variable.
 *
 * Usage:
 *   - Set CLIENT_ID in .env.local for local dev
 *   - Set CLIENT_ID in Vercel env vars for each deployment
 *
 * To add a new client:
 *   1. Copy clients/_template.ts → clients/<client-id>.ts
 *   2. Add the import + case below
 *   3. Add their images to public/<client-folder>/
 *   4. Deploy with CLIENT_ID=<client-id>
 */

import type { ClientConfig } from "./clients/types";

// ─── CLIENT REGISTRY ───────────────────────────────────────────
// Add new clients here as they onboard.
// The key must match the CLIENT_ID env var value.

import arshSandhu from "./clients/arsh-sandhu/config";
import desisquats from "./clients/desisquats/config";

const clients: Record<string, ClientConfig> = {
  "arsh-sandhu": arshSandhu,
  "desisquats": desisquats,
};

// ─── LOADER ────────────────────────────────────────────────────

const clientId =
  process.env.CLIENT_ID ||
  process.env.NEXT_PUBLIC_CLIENT_ID ||
  "";

if (!clientId) {
  // During local dev, default to first available client
  const availableClients = Object.keys(clients);
  if (availableClients.length === 0) {
    throw new Error("No client configs found in clients/ directory.");
  }
  console.warn(
    `⚠️  CLIENT_ID not set. Defaulting to "${availableClients[0]}". ` +
    `Set CLIENT_ID in .env.local for explicit control.`
  );
}

const resolvedId = clientId || Object.keys(clients)[0];

const siteConfig = clients[resolvedId];

if (!siteConfig) {
  throw new Error(
    `Unknown CLIENT_ID: "${resolvedId}". ` +
    `Available clients: ${Object.keys(clients).join(", ")}. ` +
    `Make sure you've added the client config to clients/ and registered it in site.config.ts.`
  );
}

export default siteConfig;
export type SiteConfig = ClientConfig;
