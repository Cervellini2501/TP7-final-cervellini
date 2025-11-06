// ARRANGE
const request = require('supertest');
const app = require('../index'); // Importar la app

describe('Health Check Endpoint', () => {
  
  test('GET /health debe devolver status OK', async () => {

    // ACT: Hacer request al endpoint
    const response = await request(app).get('/health');
    
    // ASSERT: Verificar resultados
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('API Palabras funcionando correctamente');
  });

  test('GET /health debe incluir información del entorno', async () => {
    // ACT
    const response = await request(app).get('/health');
    
    // ASSERT
    expect(response.body).toHaveProperty('environment');
    expect(response.body).toHaveProperty('nodeEnv');
    expect(response.body).toHaveProperty('timestamp');
  });

});