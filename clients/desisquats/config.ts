import type { ClientConfig } from "../types";

const config: ClientConfig = {

  // ─── BRAND ───────────────────────────────────────────────────
  brand: {
    name: "DESISQUATS",
    copyrightHolder: "Desisquats",
    signupSubtitle: "Join Coach Praneeth's transformation program",
    loginSubtitle: "Sign in to your Desisquats account",
  },

  // ─── COACH ───────────────────────────────────────────────────
  coach: {
    name: "Praneeth",
    firstName: "Praneeth",
    title: "Premium Transformation Coach",
    credentials: "PhD Chemistry | 10+ Years Corporate Leadership | NRI Fitness Specialist",
    quote: "This isn't about chasing abs or the scale. It's about completely rewiring how you think about food, fitness, and health for life.",
    bioBullets: [
      "Based in Portland, Oregon — understands the NRI lifestyle",
      "PhD in Chemistry — science-backed approach to nutrition",
      "10+ years corporate America — knows your schedule and stress",
      "Every plan personally designed for Indian professionals in the U.S.",
    ],
    motivations: [
      { title: "Rewire Your Relationship With Food", body: "This isn't a 21-day crash diet. We're building a sustainable lifestyle that works with your Indian meals, your cravings, and your social life." },
      { title: "Trust The Science", body: "Your plan is built on biochemistry and real data. We fix your hunger first, reset your gut, then let the results compound." },
      { title: "Consistency Over Perfection", body: "You will slip. That's expected. What matters is how fast we get you back on track. I'll be there every time." },
      { title: "Invest In Prevention", body: "People spend thousands at the hospital later but won't invest to prevent it now. You're making the smart choice." },
      { title: "Own Your Health For Life", body: "A 'just tell me what to do' mindset won't last. I'll teach you to own your nutrition so you never need a coach again." },
      { title: "You Deserve Premium Coaching", body: "This is not mass coaching. This is not $99/month. You get my full attention because your transformation deserves it." },
    ],
  },

  // ─── IMAGES ──────────────────────────────────────────────────
  images: {
    coachPhoto: "/clients/desisquats/coach.webp",
    upiQr: "",
    ogImage: "/clients/desisquats/hero-bg.webp",
  },

  // ─── COLORS (deep red/crimson accent on black) ──────────────
  colors: {
    primary: "#dc2626",
    primaryLight: "#ef4444",
    primaryDark: "#b91c1c",
    primaryRgb: [220, 38, 38],
    primaryLightRgb: [239, 68, 68],
    background: "#0a0a0a",
    foreground: "#fafafa",
  },

  // ─── CONTACT & SOCIAL ───────────────────────────────────────
  contact: {
    whatsappNumber: "19712706678",
    whatsappDisplay: "+1 (971) 270-6678",
    upiId: "",
    websiteUrl: "desisquats.com",
    instagram: "https://www.instagram.com/desisquats",
    instagramHandle: "@desisquats",
    youtube: "",
    youtubeHandle: "",
  },

  // ─── SEO METADATA ───────────────────────────────────────────
  seo: {
    title: "DESISQUATS — Premium Fitness Coaching for Indian Professionals in the U.S.",
    description: "You've built a career. Now build the body to match. Premium 1:1 transformation coaching by Praneeth — science-backed, NRI-focused, results-guaranteed.",
    ogTitle: "DESISQUATS — Coach Praneeth",
    ogDescription: "Premium fitness coaching for Indian professionals in the U.S. Science-backed. NRI-focused. Results-guaranteed.",
    twitterDescription: "You've built a career. Now build the body to match.",
  },

  // ─── CLIENT-SPECIFIC: PRICING (USD) ─────────────────────────
  pricing: {
    currency: "$",
    locale: "en-US",
    durations: ["3", "6", "12"],
    oneTimeSingle: { "3": 600, "6": 999, "12": 1800 },
    oneTimeAll: { "3": 600, "6": 999, "12": 1800 },
    gold: { "3": 600, "6": 999, "12": 1800 },
    platinum: { "3": 600, "6": 999, "12": 1800 },
    callPrice: 0,
    callDuration: "90 min",
  },
};

export default config;
