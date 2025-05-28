module.exports = {
  // Specifies the root directory Jest should scan for tests and modules within.
  // '<rootDir>' is a special token that refers to the directory where jest.config.cjs is (your 'server' directory).
  roots: ['<rootDir>'],

  // Glob patterns Jest uses to detect test files.
  testMatch: [
    '**/__tests__/**/*.+(js|jsx|mjs|cjs|ts|tsx)', // Matches files in any __tests__ directory
    '**/?(*.)+(spec|test).+(js|jsx|mjs|cjs|ts|tsx)' // Corrected: Matches name.test.js, name.spec.js, etc.
                                                  // The . before +(js|...) matches any char, should be literal dot.
                                                  // Let's make it more precise.
  ],
  // A more precise version for the second pattern:
  // testMatch: [
  //  '**/__tests__/**/*.[jt]s?(x)',
  //  '**/?(*.)+(spec|test).[jt]s?(x)'
  // ],


  // Let's use a known good default that's very common:
  // This will look for .js, .jsx, .ts, .tsx files inside __tests__ folders,
  // and also for files with a suffix of .test or .spec (e.g., MyComponent.test.js).
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],

  // Paths to ignore when looking for files.
  // This explicitly tells Jest to skip these directories/files.
  testPathIgnorePatterns: [
    "/node_modules/",
    "/config/",
    // We only have tests in 'middleware' for now. If you add tests in other folders
    // like 'controllers' or 'utils' following the *.test.js pattern,
    // they will be picked up correctly by testMatch.
    // So, we don't need to ignore controller/model/routes folders entirely if they *might*
    // contain .test.js files later. The testMatch should be sufficient.
    "<rootDir>/server.js", // Explicitly ignore server.js at the root
    "<rootDir>/babel.config.cjs", // Ignore config files
    "<rootDir>/jest.config.cjs",
    "<rootDir>/package.json",
    "<rootDir>/package-lock.json",
    "<rootDir>/seeders/", // Assuming no tests in seeders
    // Add other specific files if they are still being picked up and are not tests
  ],
  
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'node'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setupEnv.js'], // Ensure this path is correct relative to jest.config.cjs
};
