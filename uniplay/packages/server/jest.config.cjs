module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  moduleNameMapper: {
    '^@uniplay/core$': '<rootDir>/../core/src/index.ts',
  },
};