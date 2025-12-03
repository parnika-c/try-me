import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { authenticator } from "otplib"; // For generating TOTP codes

import { setDefaultTimeout } from "@cucumber/cucumber";
setDefaultTimeout(20_000); // 20 seconds for all steps

let user_email = ""; // Store for MFA retrieval

Given("I am on the Login page", async function () {
  await this.goto("/");
});

When("I enter {string} in the email field", async function (email) {
    user_email = email;
    await this.page.fill('.login-input[type="email"]', user_email);
});

When("I enter {string} in the password field", async function (password) {
    await this.page.fill('.login-input[type="password"]', password);
});

When("I click the 'Sign In' button", async function () {
    await this.page.click('.login-submit-btn');
});

Then("I should see the MFA page", async function () {
   await expect(this.page.locator("text=Two-Factor Authentication")).toBeVisible();
});

When("I submit a valid MFA token", async function () {
    // Fetch the user's MFA secret
    const res = await this.page.request.get(`http://localhost:4000/api/_test/mfa-secret?email=${user_email}`);
    const data = await res.json();
    const secret = data.mfaSecret;
    if (!secret) throw new Error("MFA secret is undefined");

    // Generate a valid TOTP
    const code = authenticator.generate(secret);
    await this.page.fill("input[placeholder='000000']", code);
});

When("I click the 'Verify Code' button", async function () {
    await this.page.click("button:has-text('Verify Code')");
});

Then("I should be logged in and redirected to the Dashboard page", async function () {
   await expect(this.page.locator("h1.dashboard-title")).toBeVisible();
});

When("I click on my profile picture in the navigation bar", async function () {
    await this.page.click(".profile-pic"); // Trigger the dropdown menu
});

When("I click the 'Sign Out' button", async function () {
    // Wait for menu to appear
    const logoutButton = this.page.locator(".menu-dropdown button.logout-btn");
    await expect(logoutButton).toBeVisible({ timeout: 5000 });
    await logoutButton.click();
});

Then("I should be logged out and taken to the Login page", async function () {
   await expect(this.page.locator("button:has-text('Sign In')")).toBeVisible();
});

Then("I should see an error message {string}", async function (errorMsg) {
  await expect(this.page.locator(`text=${errorMsg}`)).toBeVisible();
});
