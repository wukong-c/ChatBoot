import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import prettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";
import autoImport from "./config/eslintrc-auto-import.js";
import globals from "globals";

export default [
  js.configs.recommended,
  ...vue.configs["flat/recommended"],
  configPrettier,

  {
    plugins: {
      vue,
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...autoImport.globals,
        AMap: true,
      },

      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          modules: true,
          jsx: true,
        },

        requireConfigFile: false,
        parser: "@babel/eslint-parser",
      },
    },

    rules: {
      "no-unused-vars": "warn",
      "vue/multi-word-component-names": "off",
    },
  },
];
