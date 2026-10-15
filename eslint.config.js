import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../**'],
            },
          ],
        },
      ],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': 'error',
      'eol-last': ['error', 'always'],
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: false,
          ignoreMemberSort: false,
          allowSeparatedGroups: false,
        },
      ],
    },
  },
  {
    files: ['src/helpers/debugError.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
