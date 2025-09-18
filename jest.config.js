// jest.config.js
module.exports = {
  testEnvironment: 'node',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './reports/junit',
        outputName: 'jest-junit.xml',
      },
    ],
  ],
  collectCoverage: true,
  coverageDirectory: './reports/coverage',
  coverageReporters: ['lcov', 'text', 'cobertura'],
};