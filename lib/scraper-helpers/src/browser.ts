import type { Browser, Page, BrowserContext } from 'playwright-core';

// import { chromium as playwright } from 'playwright-extra';
import { chromium as playwright } from 'playwright';
// import stealth from 'puppeteer-extra-plugin-stealth';
import chromium from '@sparticuz/chromium-min';
import { execSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { createLogger } from '@namespace/logger';
import { getProxyMetadata } from '@namespace/scraper-helpers';

// playwright.use(stealth());

const logger = createLogger('scraper.browser');

const {
  SCRAPER_VIEWPORT,
  SCRAPER_LAMBDA_ENV,
  SCRAPER_PROXY,
  SCRAPER_CHROMIUM_EXECUTABLE_PATH,
  SCRAPER_HEADLESS = 'true',
  SCRAPER_TRACE_RUN,
  SCRAPER_BROWSER_KEEP_OPEN,
} = process.env;

const isLambdaEnvironment = !!SCRAPER_LAMBDA_ENV;
const enableProxy = !!SCRAPER_PROXY;
const scraperProxyUrl = SCRAPER_PROXY || '';
const headlessMode = SCRAPER_HEADLESS === 'true';
const scraperRecordRun = SCRAPER_TRACE_RUN === 'true';
const keepBrowserOpenTime =
  SCRAPER_BROWSER_KEEP_OPEN === 'true'
    ? 600000
    : !isNaN(parseInt(SCRAPER_BROWSER_KEEP_OPEN || '', 10))
      ? parseInt(SCRAPER_BROWSER_KEEP_OPEN || '', 10) * 1000
      : null;

interface BrowserControllerOptions {
  viewportSize?: { width: number; height: number };
  proxy?: boolean;
}

const [defaultViewportWidth, defaultViewportHeight] = (SCRAPER_VIEWPORT || '1300x760')
  .split('x')
  .map(Number);

export class BrowserController {
  private browser: Browser;
  private context: BrowserContext;
  private isCleanupCalled = false;

  private constructor(browser: Browser, context: BrowserContext) {
    this.browser = browser;
    this.context = context;
  }

  static async create(options: BrowserControllerOptions = {}): Promise<BrowserController> {
    const viewportSize = options.viewportSize ?? {
      width: defaultViewportWidth,
      height: defaultViewportHeight,
    };

    const executablePath = isLambdaEnvironment
      ? await chromium.executablePath('/opt/nodejs/node_modules/@sparticuz/chromium/bin')
      : SCRAPER_CHROMIUM_EXECUTABLE_PATH;

    logger.debug(`isLambdaEnvironment: ${isLambdaEnvironment ? 'yes' : 'no'}`);
    logger.debug(`Using Chromium executable path: ${executablePath}`);
    logger.debug(`Running in headless mode: ${headlessMode}`);
    logger.info('Launching browser...');

    const proxy =
      enableProxy && (typeof options.proxy !== 'boolean' || options.proxy)
        ? getProxyMetadata(scraperProxyUrl)
        : null;

    if (proxy) {
      logger.info({ proxy, proxyEnv: scraperProxyUrl }, 'Authenticating on the proxy');
    }

    const browser = await playwright.launch({
      headless: headlessMode,
      executablePath: executablePath,
      args: isLambdaEnvironment
        ? chromium.args
        : [
            '--ignore-certificate-errors',
            '--use-fake-ui-for-media-stream',
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
      ...(proxy
        ? {
            proxy: {
              server: `http://${proxy.hostname}:${proxy.port}`,
              username: proxy.username,
              password: proxy.password,
            },
          }
        : {}),
    });

    logger.info('Browser launched successfully');

    const context = await browser.newContext({
      viewport: viewportSize,
      userAgent:
        // eslint-disable-next-line max-len
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      recordVideo: scraperRecordRun ? { dir: './videos' } : undefined,
    });

    context.setDefaultTimeout(120000);

    if (scraperRecordRun) {
      logger.debug('Starting tracing');
      await context.tracing.start({ screenshots: true, snapshots: true });
    }

    return new BrowserController(browser, context);
  }

  async createPage(): Promise<Page> {
    const page = await this.context.newPage();

    await page.route('**/*', async (route) => {
      const url = route.request().url();
      if (
        url.includes('google-analytics.com') ||
        url.includes('datadoghq.com') ||
        url.includes('datadoghq-browser-agent.com')
      ) {
        await route.abort();
      } else {
        await route.continue();
      }
    });

    return page;
  }

  async close(): Promise<void> {
    if (this.isCleanupCalled) {
      logger.warn('Cleanup already called, skipping');
      return;
    }
    this.isCleanupCalled = true;

    logger.debug('Closing browser...');

    if (scraperRecordRun) {
      const traceFilePath = 'trace.zip';
      logger.debug(`Stopping tracing, saving to ${traceFilePath}`);
      await this.context.tracing.stop({ path: traceFilePath });
    }

    if (keepBrowserOpenTime) {
      logger.debug(`Keeping browser open for ${keepBrowserOpenTime} ms`);
      await sleep(keepBrowserOpenTime);
    }

    try {
      await this.browser.close();
    } catch (error) {
      logger.error(error, 'Failed to close browser using Playwright method!');
      try {
        execSync('kill -9 $(pgrep chromium)');
      } catch (error) {
        logger.error(error, 'Failed to close browser!');
      }
    }

    logger.debug('Browser closed successfully');
  }
}
