module.exports = {
    testEnvironment: "node",

    coverageDirectory:   "coverage",
    collectCoverageFrom: [
        "<rootDir>/src/**/*.ts",
    ],
    roots:               [
        "<rootDir>/src/",
        "<rootDir>/tests/",
    ],
    transform:           {
        "\\.tsx?$": "ts-jest",
    },

    testMatch: [
        "<rootDir>/tests/**/*.spec.ts",
    ],

    modulePathIgnorePatterns: [
        "<rootDir>/dist/",
    ],
    moduleFileExtensions:     [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node",
    ],
};
