// Dynamic browser scraper - safely disabled in serverless/Vercel environments
export async function scrapeWithBrowser(
  url: string,
  waitForSelector?: string,
  timeoutMs: number = 10000
): Promise<string> {
  // On Vercel or serverless environments, local Chromium executable is not present
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "";
  }

  try {
    const { chromium } = await import("playwright-core");
    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "en-IN",
      timezoneId: "Asia/Kolkata",
    });

    const page = await context.newPage();

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout: 4000 }).catch(() => {});
      } else {
        await page.waitForTimeout(1000);
      }
      return await page.content();
    } finally {
      await page.close().catch(() => {});
      await context.close().catch(() => {});
      await browser.close().catch(() => {});
    }
  } catch (err) {
    console.warn("[BrowserScraper] Playwright unavailable or failed:", err);
    return "";
  }
}
