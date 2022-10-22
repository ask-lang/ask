module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    // we ignore as code test files
    testPathIgnorePatterns: ["/as-packages/", "/node_modules/"],
};
