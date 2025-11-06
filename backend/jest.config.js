module.exports = {
    // Entorno de prueba para Node.js
    testEnvironment: 'node',
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: '.',
            outputName: 'junit.xml',
        }]
    ],
    // Patrón para encontrar archivos de prueba
    testMatch: [
        '**/__tests__/**/*.js',
        '**/*.test.js'
    ],
    testPathIgnorePatterns: ['/node_modules/'],
    // Muestra resultados detallados
    verbose: true
};