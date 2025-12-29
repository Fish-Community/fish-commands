// @ts-check

import { URL, fileURLToPath } from "url";
import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig([
	{
		ignores: ["build/scripts/", "archived/", "spec/build/", "spec/plugin/", "scripts/*.js", "copy-client.js"],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				project: ["./tsconfig.json", "./spec/tsconfig.json", "./scripts/tsconfig.json"],
				tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
			}
		},
		rules: {
			"indent": [
				"warn",
				"tab",
				{
					ignoredNodes: [
						"* > TemplateLiteral",
						"TemplateLiteral ~ *",
						"TemplateLiteral *",
						"SwitchCase",
						"ConditionalExpression",
					],
				}
			],
			"no-undef": "off",
			"linebreak-style": "off",
			"semi": ["error", "always"],
			"no-unused-vars": "off",
			"prefer-const": "warn",
			"no-unexpected-multiline": "off",
			"no-empty": ["warn", {"allowEmptyCatch": true}],
			"no-control-regex": "off",
			"@typescript-eslint/no-require-imports": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/prefer-promise-reject-errors": "off",
			"@typescript-eslint/consistent-type-definitions": ["error", "type"],
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-this-alias": "off",
			"@typescript-eslint/prefer-regexp-exec": "off",
			"@typescript-eslint/array-type": ["error", {default: "array-simple"}],
			
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-function-type": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/dot-notation": "off",
			"@typescript-eslint/prefer-nullish-coalescing": "off",
			"@typescript-eslint/no-empty-function": ["warn", {
				allow: ["arrowFunctions"]
			}],
		},
	},
	{
		files: ["src/main.js", "eslint.config.ts"],
		extends: [tseslint.configs.disableTypeChecked],
	},
]);
