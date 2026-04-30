# Test Flows — Manual QA Checklist

Run these flows after any code change to verify nothing is broken.
Start the dev server with `npm run dev` and open `http://localhost:3000`.

---

## Public Pages (no auth required)

### F1: Landing Page (`/`)
- [ ] Nav shows brand name from config
- [ ] Hero heading, byline, and CTA text render from config
- [ ] Hero image loads (from `config.images.heroImage`)
- [ ] About section shows coach name, bio paragraphs from config
- [ ] About image loads (from `config.images.aboutImage`)
- [ ] Achievements grid shows 4 items from config (image, value, label)
- [ ] Testimonials section shows all testimonials from config (image, name, plan, quote)
- [ ] Programs grid shows all programs from config (emoji, name, desc)
- [ ] Footer shows brand name, social links (Instagram, YouTube, WhatsApp) from config
- [ ] Copyright shows current year + `config.brand.copyrightHolder`
- [ ] "Send Enquiry" floating button links to `/enquiry`
- [ ] "Start Your Transformation" CTA links to `/pricing`
- [ ] "Demo: Coach" and "Demo: Client" footer links work

### F2: Login Page (`/login`)
- [ ] Page renders with brand-specific subtitle from config
- [ ] Email and password fields present
- [ ] "Sign up" link goes to `/signup`
- [ ] "Forgot password?" link goes to `/forgot-password`
- [ ] "Back to home" link goes to `/`
- [ ] Submitting with valid credentials redirects to `/coach` or `/client` based on role

### F3: Signup Page (`/signup`)
- [ ] Page renders with brand-specific subtitle from config
- [ ] Name, email, password fields present
- [ ] Submitting creates account and shows success message
- [ ] "Sign in" link goes to `/login`

### F4: Forgot Password (`/forgot-password`)
- [ ] Email field present
- [ ] Submit sends reset email and shows confirmation
- [ ] "Back to Sign In" link works

### F5: Pricing Page (`/pricing`)
- [ ] Header shows pricing badge from config ("Pre-Launch")
- [ ] Step 1: All programs from config render as selectable buttons
- [ ] Step 2: Duration buttons (4/8/12 weeks from config) appear after selecting a program
- [ ] Step 3: Plan tiers show with prices from config
  - [ ] One-Time plan shows `config.pricing.oneTimeSingle` prices
  - [ ] Gold plan shows `config.pricing.gold` prices
  - [ ] Platinum plan shows `config.pricing.platinum` prices
  - [ ] Coach name appears in plan descriptions from config
- [ ] Step 3b: One-Time sub-options appear when One-Time is selected
- [ ] Step 4: "About You" form appears after plan selection
- [ ] Price summary card shows correct calculated price
- [ ] "Proceed to Payment" button shows payment step
- [ ] Payment step: UPI QR image loads from config, UPI ID shows from config
- [ ] **Back button** on payment step returns to plan details
- [ ] Name/phone/email fields present
- [ ] "Confirm Payment" disabled until screenshot + all fields filled

### F6: Enquiry Page (`/enquiry`)
- [ ] Header shows "Get Started with Coach {firstName}" from config
- [ ] 4-step form: Basic Info → Goals → Lifestyle → Final
- [ ] Step 1: Name and phone required to proceed
- [ ] Step 2: Goal selection required
- [ ] Step 3: Diet, gym, injuries fields
- [ ] Step 4: Referral source, message, summary preview
- [ ] "How did you find Coach {firstName}?" label from config
- [ ] Submit opens WhatsApp with pre-formatted message using brand name from config

### F7: Book Call Page (`/book-call`)
- [ ] Shows "1-on-1 with Coach {firstName}" from config
- [ ] Call duration from config (e.g., "15 min")
- [ ] Price from config (e.g., "₹499")
- [ ] UPI QR image loads from config
- [ ] UPI ID shows from config
- [ ] "Confirm Booking" disabled until screenshot + all fields filled
- [ ] Success state shows coach name from config

### F8: About Platform (`/about-platform`)
- [ ] Nav shows brand name from config
- [ ] Hero subtitle from config
- [ ] Disclaimer text from config
- [ ] 5 feature steps render from config with correct titles and descriptions
- [ ] Live demo iframes load for each feature
- [ ] "How {firstName} Works With You" section from config
- [ ] 5 process steps render from config
- [ ] CTA text from config
- [ ] Copyright from config

---

## Coach Portal (Demo Mode — append `?demo=true`)

### F9: Coach Dashboard (`/coach?demo=true`)
- [ ] Sidebar shows brand name, coach photo, coach first name, title from config
- [ ] All nav links include `?demo=true` suffix
- [ ] Dashboard shows: 4 active clients, 3 active plans, 2 pending check-ins
- [ ] Pending check-in cards show client name, date, weight, photo count
- [ ] Active clients list shows names and goals

### F10: Coach Leads (`/coach/leads?demo=true`)
- [ ] Page loads (may show empty state if no demo data for leads)
- [ ] Stats cards render (Total, Contacted, Converted)
- [ ] Filter tabs work (All, New, Contacted, Converted)

### F11: Coach Clients (`/coach/clients?demo=true`)
- [ ] Page loads (may show empty state in demo)
- [ ] "My Clients" and "Find & Add" tabs render
- [ ] "Add Client" button opens modal

### F12: Coach Diet Plans (`/coach/plans?demo=true`)
- [ ] Page loads
- [ ] "New Plan" button links to `/coach/plans/create?demo=true`

### F13: Coach Workouts (`/coach/workouts?demo=true`)
- [ ] Page loads
- [ ] "New Workout" button links to `/coach/workouts/create?demo=true`

### F14: Coach Check-ins (`/coach/check-ins?demo=true`)
- [ ] Page loads (may show empty state in demo)

### F15: Coach Settings (`/coach/settings?demo=true`)
- [ ] Page loads with profile form
- [ ] Name and email fields are editable
- [ ] "Save Changes" button is present

---

## Client Portal (Demo Mode — append `?demo=true`)

### F16: Client Home (`/client?demo=true`)
- [ ] Navbar shows brand name from config
- [ ] "DEMO" badge visible
- [ ] Current plan card shows "Fat Loss Phase 1"
- [ ] Weight stat shows 83.2 kg
- [ ] Check-in count shows 1
- [ ] Quick action buttons: Check-in, Log Body
- [ ] Quick links: Diet Plan, Workout
- [ ] Latest coach feedback renders
- [ ] Today's meals preview shows 3 meals

### F17: Client Diet Plan (`/client/plan?demo=true`)
- [ ] Plan title, description, status badge render
- [ ] Daily macro totals (calories, protein, carbs, fat) calculate correctly
- [ ] 4 meals render with items, times, and per-meal macros
- [ ] PDF export button present

### F18: Client Workout (`/client/workout?demo=true`)
- [ ] Plan title and day count render
- [ ] Day tabs (Day 1 Push, Day 2 Pull, Day 3 Legs) are clickable
- [ ] Exercises show with sets, reps, rest, notes
- [ ] "Watch Demo" YouTube links present for known exercises
- [ ] Summary stats (exercises, total sets, est. time) render
- [ ] PDF export button present

### F19: Client Habits (`/client/habits?demo=true`)
- [ ] "Daily Checklist" heading with completion count
- [ ] Progress bar renders
- [ ] 4 habits render with emoji, name, target
- [ ] Checkbox toggles work
- [ ] Value inputs show for habits with units (L, hrs, steps)
- [ ] Completing all habits shows "All done for today!" card

### F20: Client Measurements (`/client/measurements?demo=true`)
- [ ] Latest measurement cards (weight, body fat, chest, waist, hips, arms, thighs)
- [ ] Trend chart renders with weight and body fat lines
- [ ] History list shows 5 entries in reverse chronological order

### F21: Client Check-in (`/client/check-in?demo=true`)
- [ ] Photo upload areas (Front, Side, Back)
- [ ] Weight input with kg unit
- [ ] Notes textarea
- [ ] "Submit Check-in" button
- [ ] Submitting shows success state in demo mode

### F22: Client Profile (`/client/profile?demo=true`)
- [ ] Page loads (may show loading state without real auth)

---

## Config Verification

### F23: White-Label Config Check
After changing `site.config.ts`, verify these render the new values:
- [ ] Landing page: brand name, coach name, bio, achievements, testimonials, programs
- [ ] Pricing page: prices, currency, coach name in plan descriptions
- [ ] Book call page: call price, call duration, coach name
- [ ] Sidebar: brand name, coach photo, coach name, title
- [ ] Client navbar: brand name
- [ ] SEO: page title in browser tab
- [ ] Footer: copyright holder, social links

### F24: Color Theme Check
After changing `config.colors.primary`:
- [ ] Gold accent color changes across the site
- [ ] Gradient buttons use new color
- [ ] Text gradient uses new color
- [ ] Active nav items use new color

---

## Error Scenarios

### F25: Missing Supabase Credentials
- [ ] Remove `.env.local` → app throws clear error message on page load
- [ ] Console shows warning about missing credentials

### F26: Network Failure (Supabase Down)
- [ ] Pages show "no data" empty states instead of crashing
- [ ] No unhandled promise rejections in console

---

## Notes
- Flows F2, F3, F4 require a real Supabase connection for full testing
- Flows F9-F15 and F16-F22 work in demo mode without Supabase
- Flows F23-F24 are config change verification — edit `site.config.ts` and reload
- All public pages (F1, F5-F8) work without auth
