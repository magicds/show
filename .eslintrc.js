// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  extends: "eslint:recommended",
  parserOptions: {
    sourceType: 'script'
  },
  env: {
    browser: true,
  },
  // add your custom rules here
  'rules': {
    "no-console": "off",
    "no-unused-vars": "warn"
  }
}
