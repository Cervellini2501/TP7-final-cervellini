/**
 * @jest-environment jsdom
 */

// Mock de fetch global
global.fetch = jest.fn();

describe('Funcionalidades de Login y Registro', () => {
  let localStorageMock;

  beforeEach(() => {
    // Reset del DOM
    document.body.innerHTML = `
      <div id="mensaje"></div>
      <form id="registerForm">
        <input id="registerUsername" />
        <input id="registerPassword" type="password" />
      </form>
      <form id="loginForm">
        <input id="loginUsername" />
        <input id="loginPassword" type="password" />
      </form>
    `;

    // Mock de localStorage
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Mock plano de window.location
    delete window.location;
    window.location = { href: ''};

    // Limpiar mocks
    fetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();

    // Mock de setTimeout
    jest.useFakeTimers();

    // Recargar módulos
    jest.resetModules();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('mostrarMensaje', () => {
    test('debe mostrar mensaje de error', () => {
      const login = require('../login.js');
      login.mostrarMensaje('Error de prueba', 'error');

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Error de prueba');
      expect(mensajeDiv.className).toBe('mensaje error');
      expect(mensajeDiv.style.display).toBe('block');
    });

    test('debe mostrar mensaje de éxito', () => {
      const login = require('../login.js');
      login.mostrarMensaje('Operación exitosa', 'exito');

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Operación exitosa');
      expect(mensajeDiv.className).toBe('mensaje exito');
      expect(mensajeDiv.style.display).toBe('block');
    });

    test('debe ocultar mensaje después de 3 segundos', () => {
      const login = require('../login.js');
      login.mostrarMensaje('Test', 'exito');

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.style.display).toBe('block');

      jest.advanceTimersByTime(5000);
      expect(mensajeDiv.style.display).toBe('none');
    });
  });

  describe('register', () => {
    test('debe registrar usuario exitosamente', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mensaje: 'Usuario registrado' })
      });

      const login = require('../login.js');

      document.getElementById('registerUsername').value = 'nuevouser';
      document.getElementById('registerPassword').value = 'password123';

      const event = { preventDefault: jest.fn() };
      await login.register(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/register'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'nuevouser', password: 'password123' })
        })
      );

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Usuario registrado exitosamente. Ahora puedes iniciar sesión');
      expect(mensajeDiv.className).toBe('mensaje exito');
    });

    test('debe mostrar error si username está vacío', async () => {
      const login = require('../login.js');

      document.getElementById('registerUsername').value = '';
      document.getElementById('registerPassword').value = 'password123';

      const event = { preventDefault: jest.fn() };
      await login.register(event);

      expect(fetch).not.toHaveBeenCalled();

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Complete todos los campos');
      expect(mensajeDiv.className).toBe('mensaje error');
    });

    test('debe mostrar error si password está vacío', async () => {
      const login = require('../login.js');

      document.getElementById('registerUsername').value = 'nuevouser';
      document.getElementById('registerPassword').value = '';

      const event = { preventDefault: jest.fn() };
      await login.register(event);

      expect(fetch).not.toHaveBeenCalled();

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Complete todos los campos');
      expect(mensajeDiv.className).toBe('mensaje error');
    });

    test('debe trimear espacios en blanco del username', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mensaje: 'Usuario registrado' })
      });

      const login = require('../login.js');

      document.getElementById('registerUsername').value = '  nuevouser  ';
      document.getElementById('registerPassword').value = 'password123';

      const event = { preventDefault: jest.fn() };
      await login.register(event);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ username: 'nuevouser', password: 'password123' })
        })
      );
    });

    test('no debe permitir registrar un usuario existente', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Usuario ya existe' })
      });

      const login = require('../login.js');

      document.getElementById('registerUsername').value = 'existente';
      document.getElementById('registerPassword').value = 'password123';

      const event = { preventDefault: jest.fn() };
      await login.register(event);

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Usuario ya existe');
      expect(mensajeDiv.className).toBe('mensaje error');
    });

    test('debe mostrar error genérico si el servidor no envía mensaje', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      const login = require('../login.js');

      document.getElementById('registerUsername').value = 'nuevouser';
      document.getElementById('registerPassword').value = 'password123';

      const event = { preventDefault: jest.fn() };
      await login.register(event);

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Error al registrar usuario');
      expect(mensajeDiv.className).toBe('mensaje error');
    });

    test('debe manejar error de red', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const login = require('../login.js');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      document.getElementById('registerUsername').value = 'nuevouser';
      document.getElementById('registerPassword').value = 'password123';

      const event = { preventDefault: jest.fn() };
      await login.register(event);

      expect(consoleErrorSpy).toHaveBeenCalled();

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Error al registrar usuario');
      expect(mensajeDiv.className).toBe('mensaje error');

      consoleErrorSpy.mockRestore();
    });

    test('debe resetear el formulario después de registro exitoso', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mensaje: 'Usuario registrado' })
      });

      const login = require('../login.js');

      document.getElementById('registerUsername').value = 'nuevouser';
      document.getElementById('registerPassword').value = 'password123';

      const form = document.getElementById('registerForm');
      const resetSpy = jest.spyOn(form, 'reset');

      const event = { preventDefault: jest.fn() };
      await login.register(event);

      expect(resetSpy).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('debe hacer login exitosamente y redirigir', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mensaje: 'Login exitoso' })
      });

      const login = require('../login.js');

      document.getElementById('loginUsername').value = 'testuser';
      document.getElementById('loginPassword').value = 'password123';

      const event = { preventDefault: jest.fn() };
      await login.login(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'testuser', password: 'password123' })
        })
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('usuario', 'testuser');

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Login exitoso. Redirigiendo...');
      expect(mensajeDiv.className).toBe('mensaje exito');
    });

    test('debe mostrar error si username está vacío', async () => {
      const login = require('../login.js');

      document.getElementById('loginUsername').value = '';
      document.getElementById('loginPassword').value = 'password123';

      const event = { preventDefault: jest.fn() };
      await login.login(event);

      expect(fetch).not.toHaveBeenCalled();

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Complete todos los campos');
      expect(mensajeDiv.className).toBe('mensaje error');
    });

    test('debe mostrar error si password está vacío', async () => {
      const login = require('../login.js');

      document.getElementById('loginUsername').value = 'testuser';
      document.getElementById('loginPassword').value = '';

      const event = { preventDefault: jest.fn() };
      await login.login(event);

      expect(fetch).not.toHaveBeenCalled();

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Complete todos los campos');
      expect(mensajeDiv.className).toBe('mensaje error');
    });

    test('debe trimear espacios en blanco del username', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mensaje: 'Login exitoso' })
      });

      const login = require('../login.js');

      document.getElementById('loginUsername').value = '  testuser  ';
      document.getElementById('loginPassword').value = 'password123';

      const event = { preventDefault: jest.fn() };
      await login.login(event);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('usuario', 'testuser');
    });

    test('debe mostrar error del servidor cuando falla el login', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Credenciales inválidas' })
      });

      const login = require('../login.js');

      document.getElementById('loginUsername').value = 'testuser';
      document.getElementById('loginPassword').value = 'wrongpassword';

      const event = { preventDefault: jest.fn() };
      await login.login(event);

      expect(localStorageMock.setItem).not.toHaveBeenCalled();

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Credenciales inválidas');
      expect(mensajeDiv.className).toBe('mensaje error');
    });

    test('debe mostrar error genérico si el servidor no envía mensaje', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      const login = require('../login.js');

      document.getElementById('loginUsername').value = 'testuser';
      document.getElementById('loginPassword').value = 'password123';

      const event = { preventDefault: jest.fn() };
      await login.login(event);

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Error al iniciar sesión');
      expect(mensajeDiv.className).toBe('mensaje error');
    });

    test('debe manejar error de red', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const login = require('../login.js');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      document.getElementById('loginUsername').value = 'testuser';
      document.getElementById('loginPassword').value = 'password123';

      const event = { preventDefault: jest.fn() };
      await login.login(event);

      expect(consoleErrorSpy).toHaveBeenCalled();

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.textContent).toBe('Error al iniciar sesión');
      expect(mensajeDiv.className).toBe('mensaje error');
      expect(localStorageMock.setItem).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('DOMContentLoaded event', () => {
    test('debe llamar a verificarSesion al cargar la página', () => {
      localStorageMock.getItem.mockReturnValue(null);

      require('../login.js');

      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('usuario');
    });
  });
});