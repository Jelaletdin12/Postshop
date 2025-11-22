import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import tanstackPlugin from "@tanstack/eslint-plugin-query";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Custom rules for your e-commerce project
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "@tanstack/query": tanstackPlugin,
      import: importPlugin
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error"],

      "react-hooks/exhaustive-deps": "error",

      "@tanstack/query/exhaustive-deps": "error",
      "@tanstack/query/no-unstable-deps": "error",

      "import/order": [
        "error",
        {
          "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always"
        }
      ],
      "import/no-default-export": "error",

      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ])
]);
