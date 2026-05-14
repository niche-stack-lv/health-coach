import dynamic from "next/dynamic";

/**
 * Landing Page Router
 *
 * Each client has their own custom landing page in clients/<id>/landing.tsx.
 * This file routes to the correct one based on CLIENT_ID.
 *
 * To add a new client's landing page:
 * 1. Create clients/<client-id>/landing.tsx
 * 2. Add the dynamic import + registry entry below
 */

// ─── CLIENT LANDING PAGE REGISTRY ──────────────────────────────
const landings: Record<string, React.ComponentType> = {
  "arsh-sandhu": dynamic(() => import("../../clients/arsh-sandhu/landing")),
  "desisquats": dynamic(() => import("../../clients/desisquats/landing")),
};

// ─── FALLBACK (first registered client) ────────────────────────
const DefaultLanding = dynamic(() => import("../../clients/arsh-sandhu/landing"));

export default function Home() {
  const clientId = process.env.CLIENT_ID || process.env.NEXT_PUBLIC_CLIENT_ID || "";
  const Landing = landings[clientId] || DefaultLanding;
  return <Landing />;
}
