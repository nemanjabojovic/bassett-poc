import babelParser from "@babel/eslint-parser";

export default [
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        requireConfigFile: false,
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        navigator: "readonly",
        setTimeout: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        Event: "readonly",
        alert: "readonly",
        FileReader: "readonly",
        XMLHttpRequest: "readonly",
      },
    },
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "LogicalExpression[operator='??']",
          message:
            "Usage of '??' is forbidden. Use '||' or explicit checks instead.",
        },
        {
          selector: "AssignmentExpression[operator='??=']",
          message:
            "Usage of '??=' is forbidden. Use conditional assignment instead.",
        },
      ],

      // disable everything else
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "no-case-declarations": "off",
      "no-inner-declarations": "off",
      "no-empty": "warn",
    },
    ignores: ["node_modules", "build", "dist", "public"],
  },
];
