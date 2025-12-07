import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "https://palabras-qa-vc.azurewebsites.net", // la URL de QA
    specPattern: "cypress/e2e/**/*.cy.js",               // dónde están tus tests
  },

  // 👇 ESTO VA FUERA DE `e2e`, A NIVEL RAÍZ
  reporter: "junit",
  reporterOptions: {
    mochaFile: "cypress/results/results-[hash].xml",
    toConsole: true,
  },

  experimentalStudio: true,
});
