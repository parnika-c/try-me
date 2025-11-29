export default {
  paths: ["tests/cucumber/features/**/*.feature"],
  import: [
    "tests/cucumber/steps/**/*.js",
    "tests/cucumber/support/world.js",
    "tests/cucumber/support/hooks.js"
  ],
  publishQuiet: true,
  format: ["progress"],
  parallel: 1
};
