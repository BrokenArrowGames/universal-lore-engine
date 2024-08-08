// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs.customize({
    flat: true,
    indent: 2,
    arrowParens: true,
    blockSpacing: true,
    braceStyle: "1tbs",
    commaDangle: "always-multiline",
    semi: true,
    quotes: "double",
    quoteProps: "consistent-as-needed",
  }),
  stylistic.configs['disable-legacy'],
  {
    files: ["*/**/*.{js,ts}"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    rules: {
      "@stylistic/operator-linebreak": [
        "error",
        "before"
      ],
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ]
    }
  }
);
