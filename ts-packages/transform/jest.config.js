export default {
    preset: "ts-jest/presets/js-with-ts",
    testEnvironment: "node",
    // we ignore as code test files
    testPathIgnorePatterns: ["./src"],
    // transformIgnorePatterns: ["node_modules/(?!assemblyscript)"]
};
