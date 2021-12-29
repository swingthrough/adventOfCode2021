module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 13,
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // 'eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],

      env: { commonjs: true, es2021: true, node: true },
      extends: [
        // 'eslint:recommended',
        // 'plugin:@typescript-eslint/eslint-recommended',
        // 'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        // ecmaVersion: 2018,
        tsconfigRootDir: __dirname,
        project: './tsconfig.json',
        // sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        // indent: ['error', 2, { SwitchCase: 1 }],
        // 'linebreak-style': ['error', 'unix'],
        // quotes: ['error', 'single'],
        // 'comma-dangle': ['error', 'always-multiline'],
        // '@typescript-eslint/no-explicit-any': 0,
        // '@typescript-eslint/no-implicit-any': 1,
        // '@typescript-eslint/no-var-requires': 0,
        // 'no-shadow': 'error',
        /*
        override no-shadow to avoid a bug:
        '<EnumName>' is already declared in the upper scope on line x column y.
        where x is actually the line number of the only definition of the enum
  
        https://stackoverflow.com/questions/63961803/eslint-says-all-enums-in-typescript-app-are-already-declared-in-the-upper-scope
        
        so we need both:
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
      */
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['warn'],

        /**
         *
         *
         */
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
      },
    },
  ],
};
