import js from "@eslint/js";
import ts from "typescript-eslint";
import vue from "eslint-plugin-vue";
export default ts.config(
  {
    ignores: [
      "dist/**",
      "output/**",
      "**/node_modules/**",
      "video/dist/**",
      "public/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: ts.parser } },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/html-self-closing": "off",
    },
  },
  {
    languageOptions: {
      globals: { console: "readonly", process: "readonly", URL: "readonly" },
    },
    rules: {
      "vue/html-indent": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/multiline-html-element-content-newline": "off",
    },
  },
  {
    files: [
      "scripts/tea-film/*.js",
      "scripts/render-tea-films.mjs",
      "scripts/render-tea-props.mjs",
      "video/src/*.js",
    ],
    languageOptions: { globals: { window: "readonly", document: "readonly" } },
  },
  { files: ["**/*.ts", "**/*.tsx", "**/*.vue"], rules: { "no-undef": "off" } },
);
