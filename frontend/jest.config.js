module.exports = {
  // Simula un navegador (DOM) para probar código frontend
  testEnvironment: 'jsdom',

  // Archivos de test
  testMatch: ['**/__tests__/**/*.test.js'],

  // Ejecuta setup.js después de cargar Jest (CORRECTO para beforeEach)
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

  // Mapea estilos a un mock vacío
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__tests__/styleMock.js'
  },

  verbose: true,

  // --- Cobertura ---
  collectCoverageFrom: [
    '**/*.js',
    '!**/__tests__/**',
    '!**/coverage/**',
    '!node_modules/**',
    '!**/index.js',   // index.js solo sirve HTML, no lo testeamos
    '!jest.config.js',
    '!**/cypress/**',
    '!cypress.config.js'
  ],

  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'json-summary',
    'cobertura'
  ],

  coverageThreshold: {
    global: {
      branches: 65,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // --- Reportes para Azure DevOps ---
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml'
    }]
  ],
};
