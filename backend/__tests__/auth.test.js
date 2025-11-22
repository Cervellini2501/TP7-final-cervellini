const request = require('supertest');
const app = require('../index');
const db = require('../db');

// Mock de la base de datos
jest.mock('../db');

describe('Autenticación API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/register', () => {
        test('debería registrar un nuevo usuario correctamente', async () => {
            // Arrange
            const nuevoUsuario = {
                username: 'testuser',
                password: 'testpass123'
            };

            db.run.mockImplementation((query, params, callback) => {
                callback.call({ lastID: 1 }, null);
            });

            // Act
            const response = await request(app)
                .post('/api/register')
                .send(nuevoUsuario);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 1);
            expect(response.body).toHaveProperty('username', 'testuser');
            expect(response.body).toHaveProperty('mensaje', 'Usuario registrado exitosamente');
            expect(db.run).toHaveBeenCalledTimes(1);
        });

        test('debería validar que username y password sean requeridos', async () => {
            // Act & Assert - Sin username
            const response1 = await request(app)
                .post('/api/register')
                .send({ password: 'testpass123' });

            expect(response1.status).toBe(400);
            expect(response1.body).toHaveProperty('error', 'Usuario y contraseña requeridos');

            // Act & Assert - Sin password
            const response2 = await request(app)
                .post('/api/register')
                .send({ username: 'testuser' });

            expect(response2.status).toBe(400);
            expect(response2.body).toHaveProperty('error', 'Usuario y contraseña requeridos');

            // Act & Assert - Sin ambos
            const response3 = await request(app)
                .post('/api/register')
                .send({});

            expect(response3.status).toBe(400);
            expect(response3.body).toHaveProperty('error', 'Usuario y contraseña requeridos');
        });

        test('debería retornar error si el usuario ya existe', async () => {
            // Arrange
            const usuarioExistente = {
                username: 'existinguser',
                password: 'testpass123'
            };

            db.run.mockImplementation((query, params, callback) => {
                const error = new Error('UNIQUE constraint failed: usuarios.username');
                callback.call({ lastID: null }, error);
            });

            // Act
            const response = await request(app)
                .post('/api/register')
                .send(usuarioExistente);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'El usuario ya existe');
        });

        test('debería manejar errores de base de datos', async () => {
            // Arrange
            const nuevoUsuario = {
                username: 'testuser',
                password: 'testpass123'
            };

            db.run.mockImplementation((query, params, callback) => {
                callback.call({ lastID: null }, new Error('Database error'));
            });

            // Act
            const response = await request(app)
                .post('/api/register')
                .send(nuevoUsuario);

            // Assert
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/login', () => {
        test('debería iniciar sesión correctamente con credenciales válidas', async () => {
            // Arrange
            const credenciales = {
                username: 'testuser',
                password: 'testpass123'
            };

            const usuarioMock = {
                id: 1,
                username: 'testuser',
                password: 'testpass123'
            };

            db.get.mockImplementation((query, params, callback) => {
                callback(null, usuarioMock);
            });

            // Act
            const response = await request(app)
                .post('/api/login')
                .send(credenciales);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 1);
            expect(response.body).toHaveProperty('username', 'testuser');
            expect(response.body).toHaveProperty('mensaje', 'Login exitoso');
            expect(db.get).toHaveBeenCalledTimes(1);
        });

        test('debería validar que username y password sean requeridos', async () => {
            // Act & Assert - Sin username
            const response1 = await request(app)
                .post('/api/login')
                .send({ password: 'testpass123' });

            expect(response1.status).toBe(400);
            expect(response1.body).toHaveProperty('error', 'Usuario y contraseña requeridos');

            // Act & Assert - Sin password
            const response2 = await request(app)
                .post('/api/login')
                .send({ username: 'testuser' });

            expect(response2.status).toBe(400);
            expect(response2.body).toHaveProperty('error', 'Usuario y contraseña requeridos');
        });

        test('debería retornar error con credenciales incorrectas', async () => {
            // Arrange
            const credenciales = {
                username: 'testuser',
                password: 'wrongpassword'
            };

            db.get.mockImplementation((query, params, callback) => {
                callback(null, null); // No se encontró el usuario
            });

            // Act
            const response = await request(app)
                .post('/api/login')
                .send(credenciales);

            // Assert
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Usuario o contraseña incorrectos');
        });

        test('debería manejar errores de base de datos', async () => {
            // Arrange
            const credenciales = {
                username: 'testuser',
                password: 'testpass123'
            };

            db.get.mockImplementation((query, params, callback) => {
                callback(new Error('Database error'), null);
            });

            // Act
            const response = await request(app)
                .post('/api/login')
                .send(credenciales);

            // Assert
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });
});
