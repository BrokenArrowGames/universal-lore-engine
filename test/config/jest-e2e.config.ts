import type { Config } from "jest";
import { BaseConfig } from "./jest-common.config";

const config: Config = {
  ...BaseConfig,
  testMatch: ["<rootDir>/test/**/*.e2e-spec.ts"],
};

export default config;
