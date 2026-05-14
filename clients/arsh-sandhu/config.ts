import type { ClientConfig } from "../types";

const config: ClientConfig = {

  // ─── BRAND ───────────────────────────────────────────────────
  brand: {
    name: "SHREDCODE",
    tagline: "Transform Your Body. Elevate Your Life.",
    copyrightHolder: "Coach Arshpreet Singh Sandhu",
    signupSubtitle: "Join Coach Arsh's SHREDCODE coaching platform",
    loginSubtitle: "Sign in to your SHREDCODE account",
    pricingBadge: "Pre-Launch",
    heroCta: "Start Your Transformation",
    heroCtaSub: "🔥 Pre-Launch Offer — Book Now",
  },

  // ─── COACH ───────────────────────────────────────────────────
  coach: {
    name: "Arshpreet Singh Sandhu",
    firstName: "Arsh",
    title: "Lifestyle Coach",
    credentials: "Lifestyle Coach | Fitness & Nutrition | #SHREDCODE",
    quote: "Real progress isn't loud. It's quiet. It's in the self-respect you rebuild — one decision at a time.",
    bioBullets: [
      "Certified Lifestyle & Fitness Coach",
      "Vegetarian-friendly nutrition specialist",
      "Based in Mohali, Punjab",
      "Every plan personally designed — no templates, ever",
    ],
    motivations: [
      { title: "Dedication Over Motivation", body: "Motivation fades. Dedication is what gets you to the gym on the days you don't feel like it. Show up every single day." },
      { title: "Trust The Process", body: "Your plan is built on science and experience. Follow it precisely. Results don't come from doing it your way — they come from doing it the right way." },
      { title: "Consistency Is King", body: "One perfect week means nothing. 12 consistent weeks means everything. Small daily actions compound into extraordinary results." },
      { title: "Nutrition Is 70%", body: "You cannot out-train a bad diet. Your meal plan is not optional — it is the foundation everything else is built on." },
      { title: "Recovery Is Training", body: "Muscles grow when you rest, not when you lift. Sleep 7-8 hours. Manage stress. Recovery is not laziness — it is strategy." },
      { title: "Track Everything", body: "Submit your weekly check-ins without fail. Photos, weight, notes. What gets measured gets managed. This is how we adjust and keep you progressing." },
    ],
  },

  // ─── IMAGES (platform-level only) ───────────────────────────
  images: {
    coachPhoto: "/clients/arsh-sandhu/Shades and Seasons of Life (1).jpg",
    upiQr: "/upi-qr.jpg",
    ogImage: "/clients/arsh-sandhu/Shades and Seasons of Life (2).jpg",
  },

  // ─── COLORS ─────────────────────────────────────────────────
  colors: {
    primary: "#0ea5e9",
    primaryLight: "#38bdf8",
    primaryDark: "#0284c7",
    primaryRgb: [14, 165, 233],
    primaryLightRgb: [56, 189, 248],
    background: "#0a0a0a",
    foreground: "#fafafa",
  },

  // ─── CONTACT & SOCIAL ───────────────────────────────────────
  contact: {
    whatsappNumber: "917351111165",
    whatsappDisplay: "+91 73511 11165",
    upiId: "",
    websiteUrl: "shredcode.in",
    instagram: "https://www.instagram.com/arshsandhu713/",
    instagramHandle: "@arshsandhu713",
    youtube: "",
    youtubeHandle: "",
  },

  // ─── PRICING ─────────────────────────────────────────────────
  pricing: {
    currency: "₹",
    locale: "en-IN",
    durations: ["4", "8", "12"],
    oneTimeSingle: { "4": 999, "8": 1599, "12": 1999 },
    oneTimeAll: { "4": 1999, "8": 2999, "12": 3999 },
    gold: { "4": 4999, "8": 7999, "12": 10999 },
    platinum: { "4": 6999, "8": 10999, "12": 14999 },
    callPrice: 499,
    callDuration: "15 min",
  },

  // ─── SEO METADATA ───────────────────────────────────────────
  seo: {
    title: "SHREDCODE by Arshpreet Singh Sandhu — Transform Your Body, Elevate Your Life",
    description: "Custom diet plans, workout programs & weekly check-ins — personally designed by Lifestyle Coach Arshpreet Singh Sandhu. Vegetarian-friendly. Based in Mohali, Punjab.",
    ogTitle: "SHREDCODE — Coach Arshpreet Singh Sandhu",
    ogDescription: "Transform Your Body. Elevate Your Life. Custom diet, workout & lifestyle plans by Coach Arsh.",
    twitterDescription: "Transform Your Body. Elevate Your Life. #SHREDCODE",
  },

  // ─── PROGRAMS (used by pricing page) ────────────────────────
  programs: [
    { name: "Fat Loss", emoji: "🔥" },
    { name: "Weight Loss", emoji: "⚖️" },
    { name: "Body Recomposition", emoji: "💪" },
    { name: "Lifestyle Transformation", emoji: "🌟" },
    { name: "General Fitness", emoji: "🏃" },
    { name: "Healthy Aging & Longevity", emoji: "🌿" },
  ],

  // ─── ABOUT PLATFORM PAGE ────────────────────────────────────
  aboutPlatform: {
    heroSubtitle: "When you sign up with Coach Arsh, you get access to your own personal portal. Here's exactly what your experience looks like — from day one to your goal.",
    disclaimer: "All diet plans, workouts, and data shown below are samples for demonstration only. Do not follow them — your actual plan will be personalized by Coach Arsh.",
    features: [
      { step: "01", title: "Your Personalized Diet Plan", desc: "Coach Arsh builds a meal plan tailored to your body, your goals, and your food preferences — with vegetarian-friendly options always available. Every meal is laid out with exact portions and macros — no guesswork.", demoPath: "/client/plan?demo=true", color: "from-green-500/15" },
      { step: "02", title: "Custom Workout Program", desc: "Get a structured workout plan designed specifically for you — exercises, sets, reps, and rest periods all mapped out. Each exercise comes with video guidance so you know exactly what to do in the gym.", demoPath: "/client/workout?demo=true", color: "from-blue-500/15" },
      { step: "03", title: "Weekly Check-ins With Arsh", desc: "Every week, you submit your weight, progress photos, and notes directly through the app. Arsh personally reviews each check-in and adjusts your diet and training based on how your body is responding. This is real coaching — not a PDF you never hear about again.", demoPath: "/client/check-in?demo=true", color: "from-purple-500/15" },
      { step: "04", title: "Track Your Progress", desc: "See your body measurements, weight trends, and progress over time with clear visual charts. Watch the numbers move in the right direction week after week — it keeps you motivated and accountable.", demoPath: "/client/measurements?demo=true", color: "from-rose-500/15" },
      { step: "05", title: "Daily Habits & Accountability", desc: "Arsh sets daily habits for you — water intake, steps, sleep, supplements. You check them off each day and build streaks. It's the small daily wins that add up to massive transformations.", demoPath: "/client/habits?demo=true", color: "from-teal-500/15" },
    ],
    processSteps: [
      { title: "You Fill Out the Enquiry Form", desc: "Tell Arsh about your goals, body type, diet preferences, injuries, and lifestyle. This helps him understand exactly where you are and where you want to go." },
      { title: "Arsh Builds Your Plan", desc: "Based on your profile, Arsh personally creates your diet plan and workout program. No templates — everything is built from scratch for your body." },
      { title: "You Get Access to Your Portal", desc: "Log in to your personal SHREDCODE portal. Your diet plan, workout program, and habit tracker are all waiting for you — accessible from your phone, anytime." },
      { title: "Weekly Check-ins & Adjustments", desc: "Every week, you submit your weight, photos, and how you're feeling. Arsh reviews everything and adjusts your plan to keep you on track. You're never left guessing." },
      { title: "Watch Your Body Transform", desc: "Track your measurements, see your progress charts, and watch the transformation happen week by week. The accountability and structure make all the difference." },
    ],
    ctaText: "Fill out the enquiry form and Coach Arsh will personally get back to you to discuss your goals.",
  },

};

export default config;
