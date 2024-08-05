import type { Config } from "jest";
import { BaseConfig } from "./jest-common.config";

const config: Config = {
  ...BaseConfig,
  testMatch: ["<rootDir>/test/**/*.int-spec.ts"],
  globalSetup: "<rootDir>/test/config/jest-int.setup.ts",
  globalTeardown: "<rootDir>/test/config/jest-int.teardown.ts",
};

export default config;
