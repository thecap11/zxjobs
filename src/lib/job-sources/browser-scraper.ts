import { chromium, Browser, BrowserContext, Page } from "playwright-core";

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browser && browser.isConnected()) return browser;
  browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
    ],
  });
  return browser;
}

export async function scrapeWithBrowser(
  url: string,
  waitForSelector?: string,
  timeoutMs: number = 15000
): Promise<string> {
  // On Vercel / serverless environments, local Chromium executable is not present
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "";
  }

  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    const b = await getBrowser();
    context = await b.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "en-IN",
      timezoneId: "Asia/Kolkata",
      extraHTTPHeaders: {
        "Accept-Language": "en-IN,en;q=0.9",
      },
    });

    page = await context.newPage();

    // Evade bot detection
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 8000 }).catch(() => {});
    } else {
      // Wait a bit for JS to render
      await page.waitForTimeout(2000);
    }
    return await page.content();
  } catch (err) {
    console.warn("[BrowserScraper] Playwright scraping failed or unavailable:", err);
    return "";
  } finally {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  }
}
