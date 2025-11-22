const request = require('supertest');
const app = require('../index');
const db = require('../db');

// Mock de la base de datos
jest.mock('../db');

describe('Palabras API', () => {
    // Limpiar mocks antes de cada test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/palabras', () => {
        test('debería devolver todas las palabras', async () => {
            // Arrange: configurar el mock
            const mockPalabras = [
                { id: 1, palabra: 'casa' },
                { id: 2, palabra: 'perro' }
            ];
            
            db.all.mockImplementation((query, callback) => {
                callback(null, mockPalabras);
            });

            // Act: hacer la petición
            const response = await request(app).get('/api/palabras');

            // Assert: verificar resultados
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockPalabras);
            expect(db.all).toHaveBeenCalledTimes(1);
        });

        test('debería manejar errores de la BD', async () => {
            // Simular error de base de datos
            db.all.mockImplementation((query, callback) => {
                callback(new Error('Database error'), null);
            });

            const response = await request(app).get('/api/palabras');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/palabras', () => {
        test('debería crear una nueva palabra', async () => {
            const nuevaPalabra = { palabra: 'gato' };
            
            db.run.mockImplementation((query, params, callback) => {
                callback.call({ lastID: 3 }, null);
            });

            const response = await request(app)
                .post('/api/palabras')
                .send(nuevaPalabra);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 3);
            expect(response.body.palabra).toBe('gato');
            expect(db.run).toHaveBeenCalledTimes(1);
        });

        test('debería validar que la palabra no esté vacía', async () => {
            const response = await request(app)
                .post('/api/palabras')
                .send({ palabra: '' }); // palabra vacía

            expect(response.status).toBe(400);
        });

        test('debería validar que el campo palabra exista', async () => {
            const response = await request(app)
                .post('/api/palabras')
                .send({}); // sin campo palabra

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /api/palabras/:id', () => {
        test('debería eliminar una palabra', async () => {
            db.run.mockImplementation((query, params, callback) => {
                callback.call({ changes: 1 }, null);
            });

            const response = await request(app).delete('/api/palabras/1');

            expect(response.status).toBe(200);
            expect(db.run).toHaveBeenCalledTimes(1);
        });

        test('debería retornar 404 si la palabra no existe', async () => {
            db.run.mockImplementation((query, params, callback) => {
                callback.call({ changes: 0 }, null);
            });

            const response = await request(app).delete('/api/palabras/999');

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/palabras/:id', () => {
        test('debería actualizar una palabra existente', async () => {
            const palabraActualizada = { palabra: 'gato-editado' };
            
            db.run.mockImplementation((query, params, callback) => {
                callback.call({ changes: 1 }, null);
            });

            const response = await request(app)
                .put('/api/palabras/1')
                .send(palabraActualizada);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 1);
            expect(response.body.palabra).toBe('gato-editado');
            expect(response.body).toHaveProperty('mensaje', 'Palabra actualizada exitosamente');
            expect(db.run).toHaveBeenCalledTimes(1);
        });

        test('debería validar que la palabra no esté vacía al actualizar', async () => {
            const response = await request(app)
                .put('/api/palabras/1')
                .send({ palabra: '' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'La palabra es requerida');
        });

        test('debería validar que el campo palabra exista al actualizar', async () => {
            const response = await request(app)
                .put('/api/palabras/1')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'La palabra es requerida');
        });

        test('debería retornar 404 si la palabra a actualizar no existe', async () => {
            db.run.mockImplementation((query, params, callback) => {
                callback.call({ changes: 0 }, null);
            });

            const response = await request(app)
                .put('/api/palabras/999')
                .send({ palabra: 'test' });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Palabra no encontrada');
        });

        test('debería manejar errores de base de datos al actualizar', async () => {
            db.run.mockImplementation((query, params, callback) => {
                callback.call({ changes: 0 }, new Error('Database error'));
            });

            const response = await request(app)
                .put('/api/palabras/1')
                .send({ palabra: 'test' });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });
});