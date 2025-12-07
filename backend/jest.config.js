module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  
  // Coverage: qué archivos medimos
  collectCoverageFrom: [
    '**/*.js',
    '!**/__tests__/**',
    '!**/coverage/**',
    '!node_modules/**',
    '!jest.config.js',
    '!**/cypress/**',
    '!cypress.config.js',
    // Excluimos el adaptador de base de datos porque se mockea en tests
    '!db.js'
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

  // Umbrales mínimos de coverage para el BACKEND
  // (acordes a lo que ya estás logrando con los tests actuales)
  coverageThreshold: {
    global: {
      branches: 60,    // estabas en ~62.5%
      functions: 60,   // estabas en ~60%
      lines: 70,
      statements: 70
    }
  },

  // Reporte JUnit para Azure DevOps
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test-results',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › '
      }
    ]
  ]
};
