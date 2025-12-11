import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

// NEW IMPORTS FOR ES MODULE __dirname EQUIVALENT
import path from "path";
import { fileURLToPath } from "url";

// Calculate __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: "./tsconfig.json",
        // Use the new __dirname equivalent here
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
    },
    rules: {
      // Your other general ESLint rules
    },
  },
  {
    files: ["**/*.ts"],
    rules: {
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: ["node_modules/", "lib/", "*.js", "*.d.ts"],
  },
];
