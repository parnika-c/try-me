import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 60000,
  use: {
    headless: false,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  }
});
