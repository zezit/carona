const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_baseUrl || 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: process.env.CI ? true : false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    setupNodeEvents(on, config) {
      config.env = {
        ...config.env,
        apiUrl: process.env.CYPRESS_apiUrl || 'http://localhost:8080',
        adminEmail: process.env.CYPRESS_adminEmail || 'admin@carona.com',
        adminPassword: process.env.CYPRESS_adminPassword || 'admin123',
        skipApiTests: process.env.CYPRESS_skipApiTests || false
      }

      require('@cypress/code-coverage/task')(on, config)
      return config
    },
    onUncaughtException: (err, runnable) => {
      // Don't fail the test on uncaught exceptions in CI
      if (process.env.CI) {
        console.log('Uncaught exception:', err.message)
        return false
      }
      return true
    }
  }
})