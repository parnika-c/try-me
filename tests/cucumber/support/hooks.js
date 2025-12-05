import { Before, After } from "@cucumber/cucumber";

Before(async function () {
  await this.init();
});

After(async function () {
  await this.close();
});
