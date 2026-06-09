import { test, expect } from "@playwright/test";
import siteConfig from "../../site.config";

// ═══════════════════════════════════════════════════════════════
// CLIENT FOOD CHECK-IN (/client/food-check-in?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Client Food Check-in", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/client/food-check-in?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("heading shows Daily Check-in", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /daily check-in/i })
    ).toBeVisible();
  });

  test("macro summary section is visible", async ({ page }) => {
    await expect(page.getByText(/cal/i).first()).toBeVisible();
  });

  test("weight input with placeholder", async ({ page }) => {
    await expect(
      page.getByPlaceholder("e.g. 72.5")
    ).toBeVisible();
  });

  test("meal slots render (Breakfast, Lunch, Dinner)", async ({ page }) => {
    await expect(page.getByText("Breakfast").first()).toBeVisible();
    await expect(page.getByText("Lunch").first()).toBeVisible();
    await expect(page.getByText("Dinner").first()).toBeVisible();
  });

  test("demo dishes are visible", async ({ page }) => {
    await expect(page.getByText("Overnight Oats").first()).toBeVisible();
    await expect(page.getByText("Smoothie").first()).toBeVisible();
    await expect(page.getByText("Chicken Breast 150g").first()).toBeVisible();
    await expect(page.getByText("Palak Paneer 60g").first()).toBeVisible();
    await expect(page.getByText("Mixed Salad").first()).toBeVisible();
  });

  test("submit button is disabled in demo mode", async ({ page }) => {
    const btn = page.getByRole("button", { name: /demo mode/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
  });
});

// ═══════════════════════════════════════════════════════════════
// CLIENT FAQ / VIDEO TUTORIALS (/client/faq?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Client FAQ Video Tutorials", () => {
  test.beforeEach(async ({ page }) => {
    // FAQ page has Google Drive iframes that prevent networkidle
    await page.goto("/client/faq?demo=true");
    await page.waitForLoadState("domcontentloaded");
    // Wait for heading to appear to confirm page rendered
    await page.getByRole("heading", { name: /video tutorials/i }).waitFor();
  });

  test("heading shows Video Tutorials", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /video tutorials/i })
    ).toBeVisible();
  });

  test("subtitle about diet, nutrition, and fat loss", async ({ page }) => {
    await expect(
      page.getByText("Watch helpful guides about diet, nutrition, and fat loss")
    ).toBeVisible();
  });

  test("video tutorial cards with specific titles", async ({ page }) => {
    await expect(page.getByText("How Fat Loss Actually Works")).toBeVisible();
    await expect(page.getByText("Can I Have a Cheat Meal?")).toBeVisible();
    await expect(page.getByText("How Many Calories Should I Eat?")).toBeVisible();
  });

  test("Google Drive iframes are present", async ({ page }) => {
    const iframes = page.locator('iframe[src*="drive.google.com"]');
    await expect(iframes.first()).toBeAttached();
    const count = await iframes.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test("at least 10 video tutorial cards rendered", async ({ page }) => {
    const videoIcons = page.locator(".bg-gold\\/10");
    const count = await videoIcons.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test("video icon containers present on cards", async ({ page }) => {
    // Each card has a gold-bg icon container with the Video icon
    const iconContainers = page.locator(".ring-gold\\/20");
    await expect(iconContainers.first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// CLIENT ONBOARDING (/client/onboarding?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Client Onboarding", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/client/onboarding?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("heading shows Let's Get to Know You", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /let.*s get to know you/i })
    ).toBeVisible();
  });

  test("step indicator shows Step 1 of 7", async ({ page }) => {
    await expect(page.getByText("Step 1 of 7: Profile")).toBeVisible();
  });

  test("progress bar segments render", async ({ page }) => {
    // 7 progress segments rendered as divs with rounded-full class
    const segments = page.locator(".rounded-full.h-1");
    const count = await segments.count();
    expect(count).toBe(7);
  });

  test("demographic form fields visible on step 0", async ({ page }) => {
    await expect(page.getByPlaceholder("Full name")).toBeVisible();
    await expect(page.getByText("Age").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// CLIENT CHANGE PASSWORD (/client/change-password?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Client Change Password", () => {
  test("page loads without crashing - shows loading state", async ({ page }) => {
    await page.goto("/client/change-password?demo=true");
    await page.waitForLoadState("networkidle");
    // The page checks !user and shows a spinner (no header on gate pages)
    // Verify the page at minimum rendered something without a JS error
    const body = page.locator("body");
    await expect(body).toBeVisible();
    // The spinner element should be present (animate-spin class)
    const spinner = page.locator(".animate-spin");
    await expect(spinner).toBeVisible();
  });

  test("page does not show error state", async ({ page }) => {
    await page.goto("/client/change-password?demo=true");
    await page.waitForLoadState("networkidle");
    // Verify no error text in the page
    const errorText = page.locator("text=/error|Error|ERROR/");
    await expect(errorText).toHaveCount(0);
  });
});
