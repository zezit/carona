

import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    requestTimeout: 5000,
    responseTimeout: 5000,
    defaultCommandTimeout: 5000,
    

    setupNodeEvents(on, config) {
     

      

    },
  },
  
  // ✅ MÉTODO CORRETO: usar support file para uncaught:exception
});