const jestConfig = {
  'transform': {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.js?(x)'],
  testPathIgnorePatterns: ["setup.js"],
  setupFiles: ["dotenv/config"],
  globalSetup: "./tests/setup"
}


module.exports = jestConfig
