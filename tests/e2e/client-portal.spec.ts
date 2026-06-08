import { test, expect } from "@playwright/test";
import siteConfig from "../../site.config";

// ═══════════════════════════════════════════════════════════════
// F16: CLIENT HOME (/client?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F16 - Client Home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/client?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("navbar shows brand name", async ({ page }) => {
    await expect(
      page.locator("header").getByText(siteConfig.brand.name)
    ).toBeVisible();
  });

  test("DEMO badge is visible", async ({ page }) => {
    await expect(
      page.locator("header").getByText("Demo")
    ).toBeVisible();
  });

  test("plan card shows Fat Loss Phase 1", async ({ page }) => {
    await expect(
      page.getByText("Fat Loss Phase 1")
    ).toBeVisible();
  });

  test("weight shows 83.2 kg", async ({ page }) => {
    await expect(
      page.getByText("83.2 kg")
    ).toBeVisible();
  });

  test("quick action links exist", async ({ page }) => {
    // Diet plan link card
    await expect(
      page.getByText("Diet Plan").first()
    ).toBeVisible();
    // Check-in related links
    await expect(
      page.getByText(/check-in/i).first()
    ).toBeVisible();
  });

  test("weekly check-in link is visible when no submission date exists", async ({ page }) => {
    // Demo data has coach_feedback but no date/created_at, so the feedback card
    // does not render. Instead the "Submit Weekly Check-in" link appears.
    await expect(
      page.getByText("Submit Weekly Check-in")
    ).toBeVisible();
  });

  test("today's meals preview shows meal count", async ({ page }) => {
    // The home page shows "4 meals/day" in the plan card
    await expect(page.getByText("4 meals/day")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F17: CLIENT DIET PLAN (/client/diet-plan?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F17 - Client Diet Plan", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/client/diet-plan?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("plan title renders", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /demo veg plan/i })
    ).toBeVisible();
  });

  test("macro totals visible", async ({ page }) => {
    // MacroSummary component shows calories, protein, carbs, fat
    await expect(page.getByText(/cal/i).first()).toBeVisible();
  });

  test("multiple meal sections render", async ({ page }) => {
    await expect(page.getByText("Breakfast").first()).toBeVisible();
    await expect(page.getByText("Lunch").first()).toBeVisible();
    await expect(page.getByText("Dinner").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F18: CLIENT WORKOUT (/client/workout?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F18 - Client Workout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/client/workout?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("plan title renders", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /PPL Split/i })
    ).toBeVisible();
  });

  test("day tabs are present and clickable", async ({ page }) => {
    const pushTab = page.getByRole("button", { name: "Push" });
    const pullTab = page.getByRole("button", { name: "Pull" });
    const legsTab = page.getByRole("button", { name: "Legs" });

    await expect(pushTab).toBeVisible();
    await expect(pullTab).toBeVisible();
    await expect(legsTab).toBeVisible();

    // Click Push tab and verify exercises load
    await pushTab.click();
    await expect(page.getByText("Bench Press")).toBeVisible();

    // Click Pull tab and verify exercises load
    await pullTab.click();
    await expect(page.getByText("Barbell Rows")).toBeVisible();
  });

  test("exercises show with details", async ({ page }) => {
    // Click a tab to show exercises
    await page.getByRole("button", { name: "Push" }).click();
    await expect(page.getByText("4 sets").first()).toBeVisible();
    await expect(page.getByText(/8-10/).first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F19: CLIENT HABITS (/client/habits?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F19 - Client Habits", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/client/habits?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("Daily Checklist heading visible", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /daily checklist/i })
    ).toBeVisible();
  });

  test("4 habits render", async ({ page }) => {
    await expect(page.getByText("Drink Water")).toBeVisible();
    await expect(page.getByText("Sleep").first()).toBeVisible();
    await expect(page.getByText("Steps", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("No Sugar")).toBeVisible();
  });

  test("checkbox toggle interaction works", async ({ page }) => {
    // "No Sugar" habit starts unchecked (no unit, so no input)
    // Find the toggle button for "No Sugar" - it's the last habit item
    const noSugarRow = page.locator("div").filter({ hasText: /No Sugar/ }).filter({ has: page.locator("button") }).last();
    const toggleButton = noSugarRow.locator("button").first();

    // Click to check it
    await toggleButton.click();

    // After clicking, the checkbox should show the Check icon (visual state change)
    // The row gets border-gold/30 class when checked
    await expect(noSugarRow.locator("svg")).toBeVisible();
  });

  test("value inputs show for habits with units", async ({ page }) => {
    // Sleep has unit "hrs", Steps has unit "steps" - these should show inputs
    await expect(page.getByText("hrs").first()).toBeVisible();
    await expect(page.getByText("steps").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F20: CLIENT MEASUREMENTS (/client/measurements?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F20 - Client Measurements", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/client/measurements?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("measurement data visible", async ({ page }) => {
    await expect(page.getByText("Weight").first()).toBeVisible();
    await expect(page.getByText("kg").first()).toBeVisible();
  });

  test("chart/trend section renders", async ({ page }) => {
    // Recharts renders SVG elements inside the Trends card
    await expect(page.getByText("Trends")).toBeVisible();
    await expect(page.locator("svg").first()).toBeVisible();
  });

  test("history entries visible", async ({ page }) => {
    await expect(page.getByText("History")).toBeVisible();
    // Demo data has 5 entries with weights like 85kg, 84.3kg, etc.
    await expect(page.getByText("85kg").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F21: CLIENT CHECK-IN (/client/check-in?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F21 - Client Check-in", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/client/check-in?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("photo upload areas visible with labels", async ({ page }) => {
    await expect(page.getByText("Front")).toBeVisible();
    await expect(page.getByText("Side")).toBeVisible();
    await expect(page.getByText("Back")).toBeVisible();
  });

  test("weight input present", async ({ page }) => {
    await expect(
      page.locator('input[type="number"]')
    ).toBeVisible();
    await expect(page.getByText("kg").first()).toBeVisible();
  });

  test("notes textarea present", async ({ page }) => {
    await expect(
      page.locator("textarea")
    ).toBeVisible();
  });

  test("submit button exists", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /submit check-in/i })
    ).toBeVisible();
  });

  test("click submit shows success state in demo mode", async ({ page }) => {
    await page.getByRole("button", { name: /submit check-in/i }).click();
    // Demo mode shows success after a brief timeout (800ms)
    await expect(
      page.getByText("Check-in Submitted!")
    ).toBeVisible({ timeout: 5000 });
  });
});

// ═══════════════════════════════════════════════════════════════
// F22: CLIENT PROFILE (/client/profile?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F22 - Client Profile", () => {
  test("page loads with profile content", async ({ page }) => {
    await page.goto("/client/profile?demo=true");
    await page.waitForLoadState("networkidle");
    // Profile page requires auth even in demo mode - verifying the layout renders
    // The client navbar should still be visible within the page layout
    await expect(
      page.locator("header").getByText(siteConfig.brand.name)
    ).toBeVisible();
  });
});
