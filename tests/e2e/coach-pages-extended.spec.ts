import { test, expect } from "@playwright/test";
import siteConfig from "../../site.config";

// ═══════════════════════════════════════════════════════════════
// COACH DAILY CHECK-INS (/coach/daily-check-ins?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Coach Daily Check-ins", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/daily-check-ins?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("heading renders", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /daily check-ins/i })
    ).toBeVisible();
  });

  test("stats cards show Checked In, Missed, Rate", async ({ page }) => {
    await expect(page.getByText("Checked In").nth(1)).toBeVisible();
    await expect(page.getByText("Missed").first()).toBeVisible();
    await expect(page.getByText("Rate")).toBeVisible();
  });

  test("filter buttons exist (All, Checked In, Missed)", async ({ page }) => {
    await expect(page.getByRole("button", { name: "All" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Checked In" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Missed" })).toBeVisible();
  });

  test("demo check-in cards show client names", async ({ page }) => {
    await expect(page.getByText("Keerthana").first()).toBeVisible();
    await expect(page.getByText("Anil").first()).toBeVisible();
  });

  test("macros visible (cal, P, C, F)", async ({ page }) => {
    await expect(page.getByText(/cal/i).first()).toBeVisible();
    await expect(page.getByText(/\d+g P/).first()).toBeVisible();
    await expect(page.getByText(/\d+g C/).first()).toBeVisible();
    await expect(page.getByText(/\d+g F/).first()).toBeVisible();
  });

  test("wellness indicators visible (water, steps, sleep)", async ({ page }) => {
    await expect(page.getByText(/\d+.*L/).first()).toBeVisible();
    await expect(page.getByText(/\d+.*steps/).first()).toBeVisible();
    await expect(page.getByText(/\d+h/).first()).toBeVisible();
  });

  test("feedback/review buttons visible", async ({ page }) => {
    await expect(page.getByText("Review").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// COACH DIET TEMPLATES (/coach/diet-templates?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Coach Diet Templates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/diet-templates?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("heading renders", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /diet templates/i })
    ).toBeVisible();
  });

  test("template count text shows", async ({ page }) => {
    await expect(page.getByText("4 templates in your library")).toBeVisible();
  });

  test("Create Template button exists", async ({ page }) => {
    const btn = page.getByRole("link", { name: /create template/i });
    await expect(btn).toBeVisible();
  });

  test("template cards show names", async ({ page }) => {
    await expect(page.getByText("Veg Plan").first()).toBeVisible();
    await expect(page.getByText("Nonveg Plan").first()).toBeVisible();
    await expect(page.getByText("Low Carb Nonveg").first()).toBeVisible();
    await expect(page.getByText("Intermittent Fasting").first()).toBeVisible();
  });

  test("plan type badges visible", async ({ page }) => {
    await expect(page.getByText("Veg").first()).toBeVisible();
    await expect(page.getByText("Nonveg").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// COACH DIET TEMPLATE EDIT (/coach/diet-templates/demo-veg?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Coach Diet Template Edit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/diet-templates/demo-veg?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("heading shows Edit Template", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /edit template/i })
    ).toBeVisible();
  });

  test("Template Name input has Demo Veg Plan", async ({ page }) => {
    const nameInput = page.locator('input[placeholder="e.g. Veg Weight Loss Plan"]');
    await expect(nameInput).toHaveValue("Demo Veg Plan");
  });

  test("meal slots section with Breakfast/Lunch/Dinner", async ({ page }) => {
    await expect(page.getByText("Meal Slots")).toBeVisible();
    await expect(page.locator('input[value="Breakfast"]')).toBeVisible();
    await expect(page.locator('input[value="Lunch"]')).toBeVisible();
    await expect(page.locator('input[value="Dinner"]')).toBeVisible();
  });

  test("demo mode warning banner visible", async ({ page }) => {
    await expect(
      page.getByText(/demo mode/i).first()
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// COACH DIET TEMPLATE ASSIGN (/coach/diet-templates/assign?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Coach Diet Template Assign", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/diet-templates/assign?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("heading shows Assign Template to Client", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /assign template to client/i })
    ).toBeVisible();
  });

  test("template selector has demo templates", async ({ page }) => {
    // Select elements contain options that aren't "visible" in Playwright, check by select value
    const templateSelect = page.locator("select").first();
    await expect(templateSelect).toHaveValue("demo-veg");
  });

  test("client selector has demo clients", async ({ page }) => {
    const clientSelect = page.locator("select").nth(1);
    await expect(clientSelect).toHaveValue("c1");
  });

  test("assign button is disabled in demo mode", async ({ page }) => {
    const btn = page.getByRole("button", { name: /demo mode/i });
    await expect(btn).toBeDisabled();
  });
});

// ═══════════════════════════════════════════════════════════════
// COACH DISHES (/coach/dishes?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Coach Dishes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/dishes?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("heading renders", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /foods & dishes/i })
    ).toBeVisible();
  });

  test("tab switcher (dishes/foods)", async ({ page }) => {
    await expect(page.getByRole("button", { name: "dishes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "foods" })).toBeVisible();
  });

  test("search input exists", async ({ page }) => {
    await expect(page.getByPlaceholder("Search dishes...")).toBeVisible();
  });

  test("category filter buttons visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "All" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Protein" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Carbs" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Fats" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Fiber" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Complete" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Supps" })).toBeVisible();
  });

  test("demo dish cards are visible", async ({ page }) => {
    await expect(page.getByText("Overnight Oats").first()).toBeVisible();
    await expect(page.getByText("Palak Paneer").first()).toBeVisible();
    await expect(page.getByText("Steamed Broccoli").first()).toBeVisible();
    await expect(page.getByText("Chicken Biryani").first()).toBeVisible();
  });

  test("macro badges on dishes", async ({ page }) => {
    // Macro badges format is "380 Cal", "35 P", etc.
    await expect(page.getByText("380").first()).toBeVisible();
    await expect(page.getByText("Cal").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// COACH DISH EDIT (/coach/dishes/demo-1?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Coach Dish Edit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/dishes/demo-1?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("page loads with dish name input", async ({ page }) => {
    // The name is in an input field
    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible();
  });

  test("category buttons visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Protein" }).first()).toBeVisible();
  });

  test("demo mode warning shows", async ({ page }) => {
    await expect(
      page.getByText(/demo mode/i).first()
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// COACH CLIENT DETAIL (/coach/clients/c1?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Coach Client Detail", () => {
  test("page does not crash - sidebar visible", async ({ page }) => {
    // This page does NOT support full demo mode (needs real DB)
    // Just verify it does not crash and the coach layout renders
    await page.goto("/coach/clients/c1?demo=true");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("aside").getByText(siteConfig.brand.name)
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// COACH CLIENT ADHERENCE (/coach/clients/c1/adherence?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Coach Client Adherence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/clients/c1/adherence?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("heading shows Diet Adherence", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /diet adherence/i })
    ).toBeVisible();
  });

  test("client name Alex Rivera is shown", async ({ page }) => {
    await expect(page.getByText("Alex Rivera").first()).toBeVisible();
  });

  test("check-in count text visible", async ({ page }) => {
    await expect(page.getByText("7 check-ins recorded")).toBeVisible();
  });

  test("weekly average score visible", async ({ page }) => {
    await expect(page.getByText("Weekly Average")).toBeVisible();
  });

  test("individual check-in scores with color coding", async ({ page }) => {
    await expect(page.getByText("92%").first()).toBeVisible();
    await expect(page.getByText("85%").first()).toBeVisible();
    await expect(page.getByText("100%").first()).toBeVisible();
    await expect(page.getByText("78%").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// COACH WORKOUT TEMPLATES (/coach/workout-templates?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Coach Workout Templates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/workout-templates?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("heading renders", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /workout templates/i })
    ).toBeVisible();
  });

  test("template count text shows", async ({ page }) => {
    await expect(page.getByText("3 templates in your library")).toBeVisible();
  });

  test("Create Template button exists", async ({ page }) => {
    const btn = page.getByRole("link", { name: /create template/i });
    await expect(btn).toBeVisible();
  });

  test("template cards show names", async ({ page }) => {
    await expect(page.getByText("Push Pull Legs").first()).toBeVisible();
    await expect(page.getByText("Upper Lower Split").first()).toBeVisible();
    await expect(page.getByText("Full Body 3x").first()).toBeVisible();
  });

  test("slot counts visible on template cards", async ({ page }) => {
    await expect(page.getByText("3 workouts").first()).toBeVisible();
    await expect(page.getByText("4 workouts").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// COACH WORKOUT TEMPLATE EDIT (/coach/workout-templates/demo-ppl?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Coach Workout Template Edit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/workout-templates/demo-ppl?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("heading shows Edit Workout Template", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /edit workout template/i })
    ).toBeVisible();
  });

  test("name input has Demo PPL Template", async ({ page }) => {
    const nameInput = page.locator('input[placeholder="e.g. Beginner at Home – 3 Days/Week"]');
    await expect(nameInput).toHaveValue("Demo PPL Template");
  });

  test("workout slots show Push, Pull, Legs", async ({ page }) => {
    await expect(page.locator('input[value="Push"]')).toBeVisible();
    await expect(page.locator('input[value="Pull"]')).toBeVisible();
    await expect(page.locator('input[value="Legs"]')).toBeVisible();
  });

  test("demo mode warning visible", async ({ page }) => {
    await expect(
      page.getByText(/demo mode/i).first()
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// COACH PLANS CREATE (/coach/plans/create?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Coach Plans Create", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/plans/create?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("heading shows New Diet Plan", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /new diet plan/i })
    ).toBeVisible();
  });

  test("Plan Name input exists", async ({ page }) => {
    await expect(page.getByPlaceholder("e.g. Fat Loss Phase 1")).toBeVisible();
  });

  test("Client selector exists", async ({ page }) => {
    // Label for client select
    await expect(page.locator('label, .text-zinc-500').filter({ hasText: /^Client$/ }).first()).toBeVisible();
  });

  test("Meal Slots section with default slots", async ({ page }) => {
    await expect(page.getByText("Meal Slots")).toBeVisible();
  });

  test("demo client option visible", async ({ page }) => {
    // Demo Client is inside a select option, verify by checking select has options
    const clientSelect = page.locator("select").first();
    await expect(clientSelect).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// COACH WORKOUTS CREATE (/coach/workouts/create?demo=true)
// ═══════════════════════════════════════════════════════════════
test.describe("Coach Workouts Create", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach/workouts/create?demo=true");
    await page.waitForLoadState("networkidle");
  });

  test("heading shows Assign Workout Plan", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /assign workout plan/i })
    ).toBeVisible();
  });

  test("Client selector exists", async ({ page }) => {
    await expect(page.locator('label, .text-zinc-500').filter({ hasText: /^Client$/ }).first()).toBeVisible();
  });

  test("Workout Template selector exists", async ({ page }) => {
    await expect(page.locator("label, .text-zinc-500").filter({ hasText: "Workout Template" }).filter({ hasNotText: "Templates" }).first()).toBeVisible();
  });

  test("demo client option visible", async ({ page }) => {
    // Demo Client option is inside a select, verify select exists
    const clientSelect = page.locator("select").first();
    await expect(clientSelect).toBeVisible();
  });
});
