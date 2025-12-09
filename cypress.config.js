// cypress.config.js
module.exports = {
  e2e: {
    // Para desarrollo local, no molesta tener esto:
    baseUrl: 'http://localhost:3000',

    setupNodeEvents(on, config) {
      // acá irían los event listeners si los necesitás
      return config;
    },

    reporter: 'junit',
    reporterOptions: {
      mochaFile: 'cypress/results/results-[hash].xml',
      toConsole: true,
    },

    experimentalStudio: true,
  },
};
