module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
  },
  settings: {
    jsdoc: {
      mode: 'typescript',
    },
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:node/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        printWidth: 100,
        tabWidth: 2,
        singleQuote: true,
        trailingComma: 'all',
        semi: true,
      },
    ],
    'max-len': ['error', {code: 100, ignoreUrls: true, ignoreStrings: true}],
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-missing-import': [
      'error',
      {
        tryExtensions: ['.js', '.json', '.node', '.ts'],
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
