/**
 * Shared platform config type.
 *
 * Only includes fields the core platform pages ALWAYS need.
 * Everything else is client-specific and lives in their landing.tsx
 * or as extra fields on their config (accessed via type assertion).
 */

export interface ClientConfig {
  brand: {
    /** Sidebar, navbar, PDFs, footer copyright */
    name: string;
    /** Footer copyright line */
    copyrightHolder: string;
    /** Signup page subtitle */
    signupSubtitle: string;
    /** Login page subtitle */
    loginSubtitle: string;
    /** Allow additional client-specific brand fields */
    [key: string]: string | undefined;
  };

  coach: {
    /** Sidebar, PDFs, pricing page, book-call page */
    name: string;
    /** Sidebar, about-platform, pricing, book-call — short reference */
    firstName: string;
    /** Sidebar — below coach name */
    title: string;
    /** PDF confirmation — credential line */
    credentials: string;
    /** PDF confirmation — motivational quote */
    quote: string;
    /** PDF confirmation — bullet points */
    bioBullets: string[];
    /** PDF confirmation — motivational cards */
    motivations: Array<{ title: string; body: string }>;
  };

  images: {
    /** Sidebar, PDF confirmation */
    coachPhoto: string;
    /** Pricing page, book-call page — UPI QR code */
    upiQr: string;
    /** SEO og:image meta tag */
    ogImage: string;
  };

  colors: {
    /** ThemeVars component → CSS variables, charts */
    primary: string;
    primaryLight: string;
    primaryDark: string;
    /** PDF generation (jsPDF needs RGB tuples) */
    primaryRgb: [number, number, number];
    primaryLightRgb: [number, number, number];
    /** ThemeVars component */
    background: string;
    foreground: string;
  };

  contact: {
    /** Pricing, enquiry, book-call — WhatsApp redirect */
    whatsappNumber: string;
    /** PDF confirmation — display format */
    whatsappDisplay: string;
    /** Pricing, book-call — UPI copy button */
    upiId: string;
    /** PDF confirmation — website link */
    websiteUrl: string;
    /** PDF footer */
    instagram: string;
    instagramHandle: string;
    youtube: string;
    youtubeHandle: string;
  };

  /** Root layout metadata */
  seo: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    twitterDescription: string;
  };

  /** Pricing configuration (optional — only needed if client uses pricing page) */
  pricing?: {
    currency: string;
    locale: string;
    durations: string[];
    oneTimeSingle: Record<string, number>;
    oneTimeAll: Record<string, number>;
    gold: Record<string, number>;
    platinum: Record<string, number>;
    callPrice: number;
    callDuration: string;
  };

  /** Programs list (optional — used by pricing page) */
  programs?: Array<{ name: string; emoji: string }>;

  /** About platform page content (optional) */
  aboutPlatform?: {
    heroSubtitle: string;
    disclaimer: string;
    features: Array<{ step: string; title: string; desc: string; demoPath: string; color: string }>;
    processSteps: Array<{ title: string; desc: string }>;
    ctaText: string;
  };

  /** Allow any additional client-specific fields */
  [key: string]: unknown;
}
