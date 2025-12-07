// backend/__tests__/palabras.test.js
const request = require('supertest');

// 🔹 Mock explícito del módulo '../db' ANTES de requerir app
jest.mock('../db', () => ({
  all: jest.fn(),
  run: jest.fn()
}));

// Ahora sí importamos el db mockeado y la app
const db = require('../db');
const app = require('../index');

describe('Palabras API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==============================
  // GET /api/palabras
  // ==============================
  describe('GET /api/palabras', () => {
    test('debería devolver todas las palabras', async () => {
      const mockPalabras = [
        { id: 1, palabra: 'casa', fecha_creacion: '2025-01-01' },
        { id: 2, palabra: 'perro', fecha_creacion: '2025-01-02' }
      ];

      db.all.mockImplementation((query, callback) => {
        callback(null, mockPalabras);
      });

      const res = await request(app).get('/api/palabras');

      expect(res.statusCode).toBe(200);
      expect(db.all).toHaveBeenCalled();
      expect(res.body.cantidad).toBe(mockPalabras.length);
      expect(res.body.palabras).toEqual(mockPalabras);
    });

    test('debería manejar errores de la BD', async () => {
      db.all.mockImplementation((query, callback) => {
        callback(new Error('Database error'), null);
      });

      const res = await request(app).get('/api/palabras');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ==============================
  // POST /api/palabras
  // ==============================
  describe('POST /api/palabras', () => {
    test('debería crear una nueva palabra', async () => {
      db.run.mockImplementation(function (query, params, callback) {
        // this.lastID simulando el ID generado
        callback.call({ lastID: 3 }, null);
      });

      const res = await request(app)
        .post('/api/palabras')
        .send({ palabra: 'gato' });

      expect(db.run).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        id: 3,
        palabra: 'gato'
      });
    });

    test('debería validar que la palabra no esté vacía (string vacío/espacios)', async () => {
      const res = await request(app)
        .post('/api/palabras')
        .send({ palabra: '   ' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('debería validar que el campo palabra exista', async () => {
      const res = await request(app)
        .post('/api/palabras')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('debería manejar errores de la BD al insertar', async () => {
      db.run.mockImplementation((query, params, callback) => {
        callback(new Error('Error de inserción'), null);
      });

      const res = await request(app)
        .post('/api/palabras')
        .send({ palabra: 'errorcito' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ==============================
  // DELETE /api/palabras/:id
  // ==============================
  describe('DELETE /api/palabras/:id', () => {
    test('debería eliminar una palabra existente', async () => {
      db.run.mockImplementation(function (query, params, callback) {
        callback.call({ changes: 1 }, null); // simulamos que borró 1 fila
      });

      const res = await request(app).delete('/api/palabras/1');

      expect(db.run).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('mensaje', 'Palabra eliminada exitosamente');
    });

    test('debería retornar 404 si la palabra no existe', async () => {
      db.run.mockImplementation(function (query, params, callback) {
        callback.call({ changes: 0 }, null); // no se borró nada
      });

      const res = await request(app).delete('/api/palabras/999');

      expect(db.run).toHaveBeenCalled();
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Palabra no encontrada');
    });

    test('debería manejar errores de la BD al eliminar', async () => {
      db.run.mockImplementation((query, params, callback) => {
        callback(new Error('Error al eliminar'), null);
      });

      const res = await request(app).delete('/api/palabras/2');

      expect(db.run).toHaveBeenCalled();
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });
});
