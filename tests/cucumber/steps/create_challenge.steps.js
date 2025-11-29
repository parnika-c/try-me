import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { authenticator } from "otplib"; // For generating TOTP codes

import { setDefaultTimeout } from "@cucumber/cucumber";
setDefaultTimeout(20_000); // 20 seconds for all steps

const timestamp_for_unique_name = ` ${Date.now()}`;

Given("I am an authenticated user on the Dashboard page", async function () {
  await this.goto("/");

  await this.page.fill('.login-input[type="email"]', "parnikac@ucla.edu");
  await this.page.fill('.login-input[type="password"]', "tryme@1Aee");

  await this.page.click('.login-submit-btn'); // don't wait for navigation b/c not full reload

  // Wait for MFA page
  await expect(this.page.locator("text=Two-Factor Authentication")).toBeVisible();

  // Fetch the user's MFA secret
  const res = await this.page.request.get("http://localhost:4000/api/_test/mfa-secret?email=parnikac@ucla.edu");
  const data = await res.json();
  const secret = data.mfaSecret;
  if (!secret) throw new Error("MFA secret is undefined");
  
  const code = authenticator.generate(secret); // Generate a valid TOTP

  await this.page.fill("input[placeholder='000000']", code);
  await this.page.click("button:has-text('Verify Code')");

  // Wait for dashboard page
  await expect(this.page.locator("h1.dashboard-title")).toBeVisible();
});

When("I open the Create Challenge modal", async function () {
  await this.page.click("button.create-btn");

  // Wait for modal to appear
  await expect(this.page.locator("h2:text-is('Create New Challenge')")).toBeVisible();
});

When("I fill in the challenge name {string}", async function (name) {
  await this.page.fill("#name", name + timestamp_for_unique_name); // input id is name
});

When("I fill in the challenge description {string}", async function (desc) {
  await this.page.fill("#description", desc);
});

When("I select the task-based challenge type", async function () {
  await this.page.check('input[name="type"][value="task-based"]');
});

When("I choose a start date of today", async function () {
  const today = new Date().toISOString().split("T")[0];
  await this.page.fill("#startDate", today);
});

When("I submit the challenge form", async function () {
  await this.page.click(".btn-create");
});

Then("I should see a challenge card with the name {string}", async function (name) {
  await expect(this.page.locator(`.challenge-card:has-text("${name + timestamp_for_unique_name}")`)).toBeVisible();
});
