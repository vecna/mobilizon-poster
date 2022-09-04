const jestConfig = {
  'transform': {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.js?(x)'],
  setupFiles: ["dotenv/config"],
}

module.exports = jestConfig
