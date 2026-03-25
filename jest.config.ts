import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  setupFiles: ["<rootDir>/jest.polyfills.ts"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  globals: {
    "process.env.NODE_ENV": "test",
  },
  moduleNameMapper: {
    "^@/tests/(.*)$": "<rootDir>/src/tests/$1",
    "^@/mocks/(.*)$": "<rootDir>/src/mocks/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.ts",
  },
  transform: {
    "^.+\\.[jt]sx?$": ["@swc/jest", {}],
  },
  transformIgnorePatterns: ["node_modules/(?!(jose|openid-client)/)"],
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "json", "json-summary"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/__mocks__/**",
    "!src/**/*.stories.{ts,tsx}",
    "!src/app/**/*.tsx",
    "!src/tests/**",
  ],
  verbose: true,
};

export default config;
