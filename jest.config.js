export default {
    preset: "ts-jest/presets/js-with-ts",
    testEnvironment: "node",
    // we ignore as code test files
    testPathIgnorePatterns: ["/as-packages/"],
    // transformIgnorePatterns: ["node_modules/(?!assemblyscript)"]
};
