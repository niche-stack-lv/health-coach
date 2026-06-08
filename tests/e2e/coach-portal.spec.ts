import { test, expect } from "@playwright/test";
import siteConfig from "../../site.config";

// ═══════════════════════════════════════════════════════════════
// F9: COACH DASHBOARD (/coach?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F9 - Coach Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("sidebar shows brand name", async ({ page }) => {
    await expect(
      page.locator("aside").getByText(siteConfig.brand.name)
    ).toBeVisible();
  });

  test("sidebar shows coach firstName", async ({ page }) => {
    await expect(
      page.locator("aside").getByText(siteConfig.coach.firstName)
    ).toBeVisible();
  });

  test("sidebar shows coach title", async ({ page }) => {
    await expect(
      page.locator("aside").getByText(siteConfig.coach.title)
    ).toBeVisible();
  });

  test("dashboard stat cards render", async ({ page }) => {
    await expect(page.getByText("Active Clients").first()).toBeVisible();
    await expect(page.getByText("Pending Replies").first()).toBeVisible();
  });

  test("pending check-in cards show client names from demo data", async ({ page }) => {
    await expect(page.getByText("Alex Rivera").first()).toBeVisible();
    await expect(page.getByText("Jordan Smith").first()).toBeVisible();
  });

  test("active clients section shows client names and goals", async ({ page }) => {
    // Active clients appear in the Missing Check-ins section with their goals
    await expect(page.getByText("Sam Patel").first()).toBeVisible();
    await expect(page.getByText("Taylor Chen").first()).toBeVisible();
    // Goals from demo data
    await expect(page.getByText("Fat loss").first()).toBeVisible();
    await expect(page.getByText("Muscle gain").first()).toBeVisible();
  });

  test("sidebar navigation links include ?demo=true suffix", async ({ page }) => {
    // Check that sidebar nav links contain ?demo=true
    const sidebar = page.locator("aside");

    const dashboardLink = sidebar.locator('a[href="/coach?demo=true"]');
    await expect(dashboardLink).toBeVisible();

    const leadsLink = sidebar.locator('a[href="/coach/leads?demo=true"]');
    await expect(leadsLink).toBeVisible();

    const clientsLink = sidebar.locator('a[href="/coach/clients?demo=true"]');
    await expect(clientsLink).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F10: COACH LEADS (/coach/leads?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F10 - Coach Leads", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/leads?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("page loads without errors", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /leads/i }).first()
    ).toBeVisible();
  });

  test("stats cards render", async ({ page }) => {
    await expect(page.getByText("Total").first()).toBeVisible();
    await expect(page.getByText("Contacted").first()).toBeVisible();
    await expect(page.getByText("Converted").first()).toBeVisible();
  });

  test("filter tabs render (All, New, Contacted, Converted)", async ({ page }) => {
    await expect(page.getByRole("button", { name: /^all/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /^new/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /^contacted/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /^converted/i }).first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F11: COACH CLIENTS (/coach/clients?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F11 - Coach Clients", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/clients?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("page loads with heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /clients/i }).first()
    ).toBeVisible();
  });

  test("tab navigation exists (My Clients / Find & Add)", async ({ page }) => {
    await expect(page.getByRole("button", { name: /my clients/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /find & add/i })).toBeVisible();
  });

  test("Add Client button exists", async ({ page }) => {
    await expect(page.getByRole("button", { name: /add client/i })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F12: COACH DIET PLANS (/coach/plans?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F12 - Coach Diet Plans", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/plans?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("page loads with heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /diet plans/i }).first()
    ).toBeVisible();
  });

  test("New Plan button exists", async ({ page }) => {
    const newPlanLink = page.getByRole("link", { name: /new plan/i });
    await expect(newPlanLink).toBeVisible();
    await expect(newPlanLink).toHaveAttribute("href", "/coach/plans/create");
  });
});

// ═══════════════════════════════════════════════════════════════
// F13: COACH WORKOUTS (/coach/workouts?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F13 - Coach Workouts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/workouts?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("page loads with heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /workout plans/i }).first()
    ).toBeVisible();
  });

  test("New Workout button exists", async ({ page }) => {
    const newWorkoutLink = page.getByRole("link", { name: /new workout/i });
    await expect(newWorkoutLink).toBeVisible();
    await expect(newWorkoutLink).toHaveAttribute("href", "/coach/workouts/create");
  });
});

// ═══════════════════════════════════════════════════════════════
// F14: COACH CHECK-INS (/coach/check-ins?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F14 - Coach Check-ins", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/check-ins?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("page loads without errors", async ({ page }) => {
    // The page renders within the coach layout with sidebar visible
    await expect(
      page.locator("aside").getByText(siteConfig.brand.name)
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F15: COACH SETTINGS (/coach/settings?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("F15 - Coach Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/settings?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("page loads with heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /settings/i }).first()
    ).toBeVisible();
  });

  test("profile tab is present", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /profile/i }).first()
    ).toBeVisible();
  });

  test("foods tab is present", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /foods/i }).first()
    ).toBeVisible();
  });

  test("exercises tab is present", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /exercises/i }).first()
    ).toBeVisible();
  });
});
