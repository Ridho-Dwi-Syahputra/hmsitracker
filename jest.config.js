// jest.config.js
module.exports = {
  
  // Ini untuk memperbaiki error 'uuid'
  transformIgnorePatterns: [
    "/node_modules/(?!uuid)/",
    "/tests/playwright/",
  ],

  // Ini untuk membersihkan console.log
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

};