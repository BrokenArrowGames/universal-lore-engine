import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '@db/(.*)': ['<rootDir>/src/database/$1'],
    '@err/(.*)': ['<rootDir>/src/error/$1'],
    '@mod/(.*)': ['<rootDir>/src/module/$1'],
    '@util/(.*)': ['<rootDir>/src/util/$1'],
  },
  coveragePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
  collectCoverageFrom: ['./src/**/*.(t|j)s'],
  coverageReporters: ['json-summary'],
  coverageDirectory: './coverage',
};

export default config;
