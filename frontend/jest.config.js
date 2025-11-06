module.exports = {
  // Simula un navegador (DOM) para probar código frontend
  testEnvironment: 'jsdom',
  // Busca archivos de prueba
  testMatch: ['**/__tests__/**/*.test.js'],
  // Configuración adicional antes de ejecutar las pruebas
  setupFiles: ['<rootDir>/__tests__/setup.js'],
  // Mapea archivos de estilos a un mock vacío
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__tests__/styleMock.js'
  },
  // Cobertura de código
  collectCoverageFrom: [
    '**/*.js',
    '!__tests__/**',
    '!index.js',
    '!node_modules/**'
  ],
  verbose: true
};