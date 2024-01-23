/**
 @type {import("eslint").Linter.Config}
 */
 module.exports = {
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/no-confusing-void-expression": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-unnecessary-condition": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
  },
};