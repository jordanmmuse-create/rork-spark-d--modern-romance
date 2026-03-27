const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  {
    ignores: ["dist/*"],
  },
  expoConfig,
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
]);
