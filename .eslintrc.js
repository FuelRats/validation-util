module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: '@fuelrats/eslint-config',
  reportUnusedDisableDirectives: true,
  rules: {
    'jsdoc/require-jsdoc': ['off'],
  },
  overrides: [
    {
      files: ['*.test.js'],
      rules: {
        'max-nested-callbacks': ['off'],
      },
      env: {
        jest: true,
      },
    },
  ],
}
