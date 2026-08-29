import { test, expect } from "@playwright/test";
import siteConfig from "../../site.config";

// ═══════════════════════════════════════════════════════════════
// F23: WHITE-LABEL CONFIG CHECK
// ═══════════════════════════════════════════════════════════════
test.describe("F23 - White-Label Config Check", () => {
  test("brand name appears on landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(siteConfig.brand.name).first()
    ).toBeVisible();
  });

  test("coach firstName appears on pricing page after selecting a program", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    // Select a program to reveal plan types which mention coach name
    await page.getByText("Fat Loss").first().click();
    await page.waitForLoadState("networkidle");
    // Plan features mention "Coach <firstName>"
    await expect(
      page.getByText(`Coach ${siteConfig.coach.firstName}`).first()
    ).toBeVisible();
  });

  test("callDuration appears on book-call page", async ({ page }) => {
    await page.goto("/book-call");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(siteConfig.pricing.callDuration).first()
    ).toBeVisible();
  });

  test("brand name appears in coach sidebar", async ({ page }) => {
    await page.goto("/coach?demo=true");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("aside").getByText(siteConfig.brand.name)
    ).toBeVisible();
  });

  test("brand name appears in client navbar", async ({ page }) => {
    await page.goto("/client?demo=true");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("header").getByText(siteConfig.brand.name)
    ).toBeVisible();
  });

  test("copyrightHolder appears in footer on landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(siteConfig.brand.copyrightHolder).first()
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// F24: COLOR THEME CHECK
// ═══════════════════════════════════════════════════════════════
test.describe("F24 - Color Theme Check", () => {
  test("theme CSS variables are applied via ThemeVars", async ({ page }) => {
    await page.goto("/client?demo=true");
    await page.waitForLoadState("networkidle");

    // ThemeVars injects a <style> tag that sets --gold CSS variable
    // Verify the CSS variable is set on :root
    const goldColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue("--gold").trim();
    });
    expect(goldColor).toBeTruthy();
    expect(goldColor).toContain("#");
  });

  test("gradient-gold class elements exist on page", async ({ page }) => {
    await page.goto("/client?demo=true");
    await page.waitForLoadState("networkidle");

    // The client home page has gradient-gold elements (plan card, progress bar icon bg)
    const goldElements = page.locator(".gradient-gold");
    await expect(goldElements.first()).toBeVisible();
  });

  test("text-gradient-gold elements exist on landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // The landing page uses text-gradient-gold class for headings
    const textGradientElements = page.locator(".text-gradient-gold");
    await expect(textGradientElements.first()).toBeVisible();
  });

  test("gold color is used in active nav items on coach sidebar", async ({ page }) => {
    await page.goto("/coach?demo=true");
    await page.waitForLoadState("networkidle");

    // Active nav link in sidebar uses text-gold class
    const goldNavItems = page.locator("aside .text-gold");
    await expect(goldNavItems.first()).toBeVisible();
  });
});
