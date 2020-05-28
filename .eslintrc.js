module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  plugins: [
    '@typescript-eslint',
    'baseui',
    'react',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {
    'react/prop-types': 'off',
    'jsx-quotes': ['error', 'prefer-single'],
    'max-len': ['error', { 
      'code': 120,
    }],
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'consistent-return': 'off',
    // baseui
    'baseui/deprecated-theme-api': "warn",
    'baseui/deprecated-component-api': "warn",
    'baseui/no-deep-imports': "warn"
  }
};