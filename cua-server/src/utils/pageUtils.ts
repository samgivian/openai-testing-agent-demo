import { Page } from "playwright";
import logger from "./logger";

/**
 * Scrolls the page by one viewport height at a time and captures a screenshot
 * after each scroll. Screenshots are saved as `scroll-<index>.png` in the
 * working directory.
 */
export async function scrollPageAndCapture(page: Page): Promise<void> {
  const height = page.viewportSize()?.height ?? 768;
  let scrolled = 0;
  let index = 0;
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);

  while (scrolled < totalHeight) {
    await page.evaluate((h) => window.scrollBy(0, h), height);
    await page.waitForTimeout(500);
    scrolled += height;
    index += 1;
    const path = `scroll-${index}.png`;
    await page.screenshot({ path });
    logger.debug(`Captured screenshot: ${path}`);
  }
}

/**
 * Checks for the presence of heading elements on the page.
 */
export async function validateHeadings(page: Page): Promise<{ h1: boolean; h2: boolean; h3: boolean }> {
  const [h1, h2, h3] = await Promise.all([
    page.locator("h1").count(),
    page.locator("h2").count(),
    page.locator("h3").count(),
  ]);
  const result = { h1: h1 > 0, h2: h2 > 0, h3: h3 > 0 };
  logger.debug(`Heading validation: ${JSON.stringify(result)}`);
  return result;
}
