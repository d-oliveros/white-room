const nx = require('@nx/eslint-plugin');
const tailwind = require('eslint-plugin-tailwindcss');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...tailwind.configs['flat/recommended'],
  {
    ignores: ['**/dist', '**/list/*-migration.js'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^e$',
          varsIgnorePattern: '^e$',
          caughtErrorsIgnorePattern: '^e$',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allowCircularSelfDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      indent: 0,
      'no-console': 'error',
      'comma-dangle': [
        1,
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'only-multiline',
        },
      ],
      'max-len': [
        'error',
        {
          ignoreComments: true,
          code: 120,
          ignorePattern: '^import',
        },
      ],
      'prefer-const': 'error',
      'arrow-parens': ['error', 'always'],
      '@nx/dependency-checks': ['error', { ignoredDependencies: ['pg'] }],
      'tailwindcss/classnames-order': 'off',
    },
  },
];
