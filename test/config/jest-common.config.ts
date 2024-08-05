import type { Config } from "jest";

export const BaseConfig: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "../..",
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  moduleNameMapper: {
    "@/(.*)": ["<rootDir>/src/$1"],
    "@db/(.*)": ["<rootDir>/src/database/$1"],
    "@err/(.*)": ["<rootDir>/src/error/$1"],
    "@gen/(.*)": ["<rootDir>/src/generated/$1"],
    "@mod/(.*)": ["<rootDir>/src/module/$1"],
    "@test/(.*)": ["<rootDir>/test/$1"],
    "@util/(.*)": ["<rootDir>/src/util/$1"],
  },
};
