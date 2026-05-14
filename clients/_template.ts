/**
 * ═══════════════════════════════════════════════════════════════
 * CLIENT TEMPLATE — Copy this file to create a new client config
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. Create folder: mkdir clients/<client-id>
 * 2. Copy this file: cp clients/_template.ts clients/<client-id>/config.ts
 * 3. Fill in all values below
 * 4. Create a custom landing.tsx in the same folder
 * 5. Add client images to public/<client-folder>/
 * 6. Register in site.config.ts and src/app/page.tsx
 * 7. Set CLIENT_ID=<client-id> in the deployment env vars
 */

import type { ClientConfig } from "./types";

const config: ClientConfig = {

  // ─── BRAND (sidebar, navbar, login, signup, footer) ──────────
  brand: {
    name: "",                    // e.g., "FitCoach", "SHREDCODE"
    copyrightHolder: "",         // e.g., "Coach John Doe"
    signupSubtitle: "",          // Shown on signup page
    loginSubtitle: "",           // Shown on login page
  },

  // ─── COACH (sidebar, PDFs, pricing, book-call) ──────────────
  coach: {
    name: "",                    // Full name
    firstName: "",               // Short name for casual references
    title: "",                   // e.g., "Head Coach", "Lifestyle Coach"
    credentials: "",             // One-liner for PDFs
    quote: "",                   // Motivational quote for PDF confirmation
    bioBullets: [],              // 3-5 bullet points for PDF confirmation
    motivations: [
      { title: "", body: "" },
      { title: "", body: "" },
      { title: "", body: "" },
      { title: "", body: "" },
      { title: "", body: "" },
      { title: "", body: "" },
    ],
  },

  // ─── IMAGES (sidebar, PDFs, pricing/book-call UPI) ──────────
  images: {
    coachPhoto: "",              // e.g., "/client-folder/photo.jpg"
    upiQr: "/upi-qr.jpg",       // UPI QR code image
    ogImage: "",                 // Social sharing image
  },

  // ─── COLORS (theme system, charts, PDFs) ────────────────────
  colors: {
    primary: "#d4a853",          // Main accent color
    primaryLight: "#e8c97a",
    primaryDark: "#b8922f",
    primaryRgb: [212, 168, 83],  // RGB tuple for jsPDF
    primaryLightRgb: [232, 201, 122],
    background: "#0a0a0a",
    foreground: "#fafafa",
  },

  // ─── CONTACT (WhatsApp flows, PDFs, UPI) ────────────────────
  contact: {
    whatsappNumber: "",          // e.g., "919876543210" (with country code, no +)
    whatsappDisplay: "",         // e.g., "+91 98765 43210"
    upiId: "",                   // e.g., "name@upi"
    websiteUrl: "",              // e.g., "mycoach.com"
    instagram: "",               // Full URL
    instagramHandle: "",         // e.g., "@handle"
    youtube: "",                 // Full URL (leave empty if none)
    youtubeHandle: "",           // e.g., "@channel" (leave empty if none)
  },

  // ─── SEO (root layout metadata) ────────────────────────────
  seo: {
    title: "",
    description: "",
    ogTitle: "",
    ogDescription: "",
    twitterDescription: "",
  },

  // ─── CLIENT-SPECIFIC (add whatever this client needs) ───────
  // Examples: pricing, programs, aboutPlatform, etc.
  // These are accessed by the client's custom pages (landing, pricing, etc.)

};

export default config;
