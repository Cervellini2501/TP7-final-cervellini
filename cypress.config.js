import { defineConfig } from "cypress";

export default defineConfig({
e2e: {
  baseUrl: 'http://localhost:3000', // URL base por defecto para desarrollo local
  setupNodeEvents(on, config) {
    // implement node event listeners here
  },
  reporter: 'junit',  // Configura el reporter a JUnit
  reporterOptions: {
    mochaFile: 'cypress/results/results-[hash].xml',  // Directorio y nombre de los archivos de resultados
    toConsole: true,  // Opcional: imprime los resultados en la consola
    },
},
experimentalStudio: true,
});
