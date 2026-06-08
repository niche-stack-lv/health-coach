import { test, expect } from "@playwright/test";
import siteConfig from "../../site.config";

// ═══════════════════════════════════════════════════════════════
// F1: LANDING PAGE
// ═══════════════════════════════════════════════════════════════
test.describe("F1 - Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("nav displays brand name", async ({ page }) => {
    await expect(
      page.locator("nav").getByText(siteConfig.brand.name).first()
    ).toBeVisible();
  });

  test("hero section renders heading", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("about section shows coach name", async ({ page }) => {
    await expect(
      page.getByText(siteConfig.coach.name).first()
    ).toBeVisible();
  });

  test("achievements grid shows 4 items", async ({ page }) => {
    const achievements = page.locator("text=Clients Transformed");
    await expect(achievements.first()).toBeVisible();
    // There are exactly 4 achievement items with specific labels
    await expect(page.getByText("Clients Transformed")).toBeVisible();
    await expect(page.getByText("Vegetarian Plans")).toBeVisible();
    await expect(page.getByText("Years Experience")).toBeVisible();
    await expect(page.getByText("Client Satisfaction")).toBeVisible();
  });

  test("testimonials section renders", async ({ page }) => {
    await expect(
      page.getByText("Client Transformations").first()
    ).toBeVisible();
  });

  test("programs grid shows all programs from config", async ({ page }) => {
    for (const program of siteConfig.programs || []) {
      await expect(page.getByText(program.name).first()).toBeVisible();
    }
  });

  test("footer shows brand name", async ({ page }) => {
    await expect(
      page.locator("footer").getByText(siteConfig.brand.name)
    ).toBeVisible();
  });

  test("footer copyright shows current year and copyrightHolder", async ({ page }) => {
    const year = new Date().getFullYear().toString();
    await expect(
      page.locator("footer").getByText(year)
    ).toBeVisible();
    await expect(
      page.locator("footer").getByText(siteConfig.brand.copyrightHolder)
    ).toBeVisible();
  });

  test("Send Enquiry button links to /enquiry", async ({ page }) => {
    const enquiryLink = page.getByRole("link", { name: /send enquiry/i });
    await expect(enquiryLink).toHaveAttribute("href", "/enquiry");
  });

  test("Start Your Transformation CTA links to /pricing", async ({ page }) => {
    const pricingCta = page.getByRole("link", { name: /start your transformation/i }).first();
    await expect(pricingCta).toHaveAttribute("href", "/pricing");
  });

  test("demo footer links exist", async ({ page }) => {
    await expect(
      page.locator("footer").getByRole("link", { name: /demo.*coach/i })
    ).toBeVisible();
    await expect(
      page.locator("footer").getByRole("link", { name: /demo.*client/i })
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F2: LOGIN PAGE
// ═══════════════════════════════════════════════════════════════
test.describe("F2 - Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
  });

  test("renders loginSubtitle from config", async ({ page }) => {
    await expect(
      page.getByText(siteConfig.brand.loginSubtitle)
    ).toBeVisible();
  });

  test("email and password input fields are present", async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("Sign up link href is /signup", async ({ page }) => {
    const signupLink = page.getByRole("link", { name: /sign up/i });
    await expect(signupLink).toHaveAttribute("href", "/signup");
  });

  test("Forgot password link href is /forgot-password", async ({ page }) => {
    const forgotLink = page.getByRole("link", { name: /forgot password/i });
    await expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });

  test("Back to home link href is /", async ({ page }) => {
    const homeLink = page.getByRole("link", { name: /back to home/i });
    await expect(homeLink).toHaveAttribute("href", "/");
  });
});

// ═══════════════════════════════════════════════════════════════
// F3: SIGNUP PAGE
// ═══════════════════════════════════════════════════════════════
test.describe("F3 - Signup Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");
  });

  test("renders signupSubtitle from config", async ({ page }) => {
    await expect(
      page.getByText(siteConfig.brand.signupSubtitle)
    ).toBeVisible();
  });

  test("name, email, and password fields are present", async ({ page }) => {
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("Sign in link goes to /login", async ({ page }) => {
    const signInLink = page.getByRole("link", { name: /sign in/i });
    await expect(signInLink).toHaveAttribute("href", "/login");
  });
});

// ═══════════════════════════════════════════════════════════════
// F4: FORGOT PASSWORD PAGE
// ═══════════════════════════════════════════════════════════════
test.describe("F4 - Forgot Password Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/forgot-password");
    await page.waitForLoadState("networkidle");
  });

  test("email field is present", async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("Back to Sign In link navigates to /login", async ({ page }) => {
    const backLink = page.getByRole("link", { name: /back to sign in/i });
    await expect(backLink).toHaveAttribute("href", "/login");
  });
});

// ═══════════════════════════════════════════════════════════════
// F5: PRICING PAGE (Multi-step)
// ═══════════════════════════════════════════════════════════════
test.describe("F5 - Pricing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
  });

  test("pricing badge from config renders", async ({ page }) => {
    await expect(
      page.getByText(siteConfig.brand.pricingBadge)
    ).toBeVisible();
  });

  test("multi-step pricing flow", async ({ page }) => {
    const programs = siteConfig.programs || [];
    const durations = siteConfig.pricing?.durations || ["4", "8", "12"];
    const goldPrices = siteConfig.pricing?.gold || {};
    const platinumPrices = siteConfig.pricing?.platinum || {};

    // Step 1: All programs render as buttons - click the first one
    for (const program of programs) {
      await expect(
        page.getByRole("button", { name: new RegExp(program.name) })
      ).toBeVisible();
    }
    await page.getByRole("button", { name: new RegExp(programs[0].name) }).click();

    // Step 2: Duration buttons appear
    for (const d of durations) {
      await expect(
        page.getByRole("button", { name: new RegExp(`^${d}`) }).first()
      ).toBeVisible();
    }
    // Click "8" weeks
    await page.getByRole("button", { name: /^8/ }).first().click();

    // Step 3: Plan tiers show
    await expect(page.getByText("One-Time Plan")).toBeVisible();
    await expect(page.getByText("Customized Gold").first()).toBeVisible();
    await expect(page.getByText("Customized Platinum").first()).toBeVisible();

    // Assert gold price for 8 weeks
    const goldPrice8 = goldPrices["8"];
    await expect(
      page.getByText(`₹${goldPrice8.toLocaleString("en-IN")}`).first()
    ).toBeVisible();

    // Assert platinum price for 8 weeks
    const platinumPrice8 = platinumPrices["8"];
    await expect(
      page.getByText(`₹${platinumPrice8.toLocaleString("en-IN")}`).first()
    ).toBeVisible();

    // Click Gold plan
    await page.getByRole("button", { name: /Customized Gold/i }).click();

    // Step 4: About You form appears
    await expect(page.getByText("Tell Us About Yourself")).toBeVisible();
    await expect(page.locator('label:has-text("Age")').first()).toBeVisible();
    await expect(page.locator('label:has-text("Gender")').first()).toBeVisible();

    // Assert price summary shows correct amount
    await expect(
      page.getByText(`₹${goldPrice8.toLocaleString("en-IN")}`).first()
    ).toBeVisible();

    // Click Proceed to Payment
    await page.getByRole("button", { name: /proceed to payment/i }).click();

    // Assert payment step: UPI section or payment details visible
    await expect(page.getByText("Scan QR to Pay")).toBeVisible();

    // Assert Back button exists on payment step
    await expect(
      page.getByRole("button", { name: /back to plan details/i })
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F6: ENQUIRY PAGE (4-step form)
// ═══════════════════════════════════════════════════════════════
test.describe("F6 - Enquiry Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/enquiry");
    await page.waitForLoadState("networkidle");
  });

  test("header shows coach firstName", async ({ page }) => {
    await expect(
      page.getByText(`Get Started with Coach ${siteConfig.coach.firstName}`)
    ).toBeVisible();
  });

  test("4-step form navigation", async ({ page }) => {
    // Step 1: Fill name and phone
    await expect(page.getByPlaceholder("Your name")).toBeVisible();
    await expect(page.getByPlaceholder("+91 98765 43210")).toBeVisible();
    await page.getByPlaceholder("Your name").fill("Test User");
    await page.getByPlaceholder("+91 98765 43210").fill("+91 98765 43210");

    // Proceed to step 2
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Step 2: Select a goal
    await expect(page.getByText("Your Fitness Goal")).toBeVisible();
    await page.getByRole("button", { name: "Fat Loss" }).click();

    // Proceed to step 3
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Step 3: Diet field present
    await expect(page.getByText("Diet Preference")).toBeVisible();

    // Proceed to step 4
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Step 4: Assert referral source question uses coach firstName
    await expect(
      page.getByText(`How did you find Coach ${siteConfig.coach.firstName}?`)
    ).toBeVisible();

    // Assert summary is visible
    await expect(page.getByText("Your Summary")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F7: BOOK CALL PAGE
// ═══════════════════════════════════════════════════════════════
test.describe("F7 - Book Call Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/book-call");
    await page.waitForLoadState("networkidle");
  });

  test("shows coach firstName", async ({ page }) => {
    await expect(
      page.getByText(`Coach ${siteConfig.coach.firstName}`).first()
    ).toBeVisible();
  });

  test("shows call duration from config", async ({ page }) => {
    await expect(
      page.getByText(siteConfig.pricing?.callDuration || "").first()
    ).toBeVisible();
  });

  test("shows call price formatted", async ({ page }) => {
    const callPrice = siteConfig.pricing?.callPrice || 0;
    const currency = siteConfig.pricing?.currency || "₹";
    const locale = siteConfig.pricing?.locale || "en-IN";
    const formatted = `${currency}${callPrice.toLocaleString(locale)}`;
    await expect(page.getByText(formatted).first()).toBeVisible();
  });

  test("shows UPI ID if not empty", async ({ page }) => {
    const upiId = siteConfig.contact.upiId;
    if (upiId) {
      await expect(page.getByText(upiId)).toBeVisible();
    }
  });

  test("Confirm Booking button is disabled", async ({ page }) => {
    const confirmBtn = page.getByRole("button", { name: /confirm booking/i });
    await expect(confirmBtn).toBeDisabled();
  });
});

// ═══════════════════════════════════════════════════════════════
// F8: ABOUT PLATFORM PAGE
// ═══════════════════════════════════════════════════════════════
test.describe("F8 - About Platform Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about-platform");
    await page.waitForLoadState("networkidle");
  });

  test("nav shows brand name", async ({ page }) => {
    await expect(
      page.locator("nav").getByText(siteConfig.brand.name)
    ).toBeVisible();
  });

  test("hero subtitle from config", async ({ page }) => {
    await expect(
      page.getByText(siteConfig.aboutPlatform?.heroSubtitle || "").first()
    ).toBeVisible();
  });

  test("disclaimer text from config", async ({ page }) => {
    await expect(
      page.getByText(siteConfig.aboutPlatform?.disclaimer || "").first()
    ).toBeVisible();
  });

  test("5 feature titles render", async ({ page }) => {
    const features = siteConfig.aboutPlatform?.features || [];
    expect(features.length).toBe(5);
    for (const feature of features) {
      await expect(
        page.getByText(feature.title).first()
      ).toBeVisible();
    }
  });

  test("5 process step titles render", async ({ page }) => {
    const processSteps = siteConfig.aboutPlatform?.processSteps || [];
    expect(processSteps.length).toBe(5);
    for (const step of processSteps) {
      await expect(
        page.getByText(step.title).first()
      ).toBeVisible();
    }
  });

  test("CTA text from config", async ({ page }) => {
    await expect(
      page.getByText(siteConfig.aboutPlatform?.ctaText || "").first()
    ).toBeVisible();
  });

  test("copyright shows copyrightHolder", async ({ page }) => {
    await expect(
      page.locator("footer").getByText(siteConfig.brand.copyrightHolder)
    ).toBeVisible();
  });
});
