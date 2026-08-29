import { test, expect } from "@playwright/test";
import siteConfig from "../../site.config";

test("landing page displays brand name", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByText(siteConfig.brand.name).first()).toBeVisible();
});
