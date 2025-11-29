import { setWorldConstructor } from "@cucumber/cucumber";
import { chromium } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

export class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async init() {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async goto(path) {
    await this.page.goto(`${BASE_URL}${path}`);
  }

  async close() {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(CustomWorld);
