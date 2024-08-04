import type { Config } from 'jest';
import { BaseConfig } from './jest-common.config';

const config: Config = {
  ...BaseConfig,
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/database/migration',
    '<rootDir>/src/database/seed',
  ],
  collectCoverageFrom: ['./src/**/*.(t|j)s'],
  coverageReporters: ['json-summary', 'text'],
  coverageDirectory: './coverage',
};

export default config;
