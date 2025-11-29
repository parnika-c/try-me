import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

import { setDefaultTimeout } from "@cucumber/cucumber";
setDefaultTimeout(20_000); // 20 seconds for all steps

Given("I am an authenticated user on the Dashboard page", async function () {
  await this.goto("/");

  await this.page.fill('.login-input[type="email"]', "parnika@fake.com");
  await this.page.fill('.login-input[type="password"]', "hifake!0Ab");
  await this.page.click('.login-submit-btn');

  // wait for navigation after clicking submit
  await Promise.all([
    this.page.waitForNavigation({ waitUntil: "networkidle" }),
    await this.page.click('.login-submit-btn')
  ]);

  // TODO: get around MFA for testing

  await expect(this.page.locator("text=My Challenges")).toBeVisible();
});

When("I open the Create Challenge modal", async function () {
  await this.page.click("button.create-btn");

  // Wait for modal to appear
  await expect(this.page.locator("h2:text-is('Create New Challenge')")).toBeVisible();
});

When("I fill in the challenge name {string}", async function (name) {
  await this.page.fill("#name", name); // input id is name
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
  await expect(this.page.locator(`.challenge-card:has-text("${name}")`)).toBeVisible();
});
