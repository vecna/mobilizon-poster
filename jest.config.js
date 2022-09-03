const jestConfig = {
  'transform': {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.js?(x)'],
}

module.exports = jestConfig

