// cypress.config.js en la raíz del repo

module.exports = {
  e2e: {
    // Hook de configuración (si mañana querés agregar tasks, etc.)
    setupNodeEvents(on, config) {
      // por ahora no hacemos nada especial
      return config;
    },

    // Reporter JUnit para que Azure lea los XML
    reporter: "junit",
    reporterOptions: {
      mochaFile: "cypress/results/junit-[hash].xml",
      toConsole: true,
    },

    // Base URL por defecto (se sobreescribe en el pipeline con --config)
    baseUrl: "http://localhost:3000",
  },

  experimentalStudio: true,
};
