// eslint.config.js — configuración para el análisis estático (SQA)
module.exports = [
  {
    files: ['src/**/*.js', 'db/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { process: 'readonly', console: 'readonly', __dirname: 'readonly', require: 'readonly', module: 'writable' }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'prefer-const': 'warn',
      'eqeqeq': 'warn'
    }
  }
];
