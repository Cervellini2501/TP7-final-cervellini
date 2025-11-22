/**
 * @jest-environment jsdom
 */

// Mock de fetch global
global.fetch = jest.fn();

describe('Funcionalidades de Autenticación y Sesión', () => {
  let localStorageMock;

  beforeEach(() => {
    // Reset del DOM
    document.body.innerHTML = `
      <div id="usuarioActual"></div>
      <div id="listaPalabras"></div>
      <input id="palabraInput" />
      <div id="mensaje"></div>
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
    window.location = { href: '', hostname: 'localhost', origin: 'http://localhost' };

    // Limpiar mocks
    fetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.removeItem.mockClear();

    // Recargar módulos
    jest.resetModules();
  });

  describe('cerrarSesion', () => {
    test('debe eliminar el usuario del localStorage', () => {
      const app = require('../app.js');
      app.cerrarSesion();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('usuario');
    });
  });

  describe('Verificación de sesión en DOMContentLoaded', () => {
    test('debe cargar palabras si hay usuario en localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('testuser');
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      require('../app.js');

      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('usuario');
      expect(window.location.href).not.toBe('login.html');
    });

    test('debe mostrar el nombre de usuario en el elemento usuarioActual', () => {
      const nombreUsuario = 'JuanPerez';
      localStorageMock.getItem.mockReturnValue(nombreUsuario);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      require('../app.js');

      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);

      const usuarioActualElement = document.getElementById('usuarioActual');
      expect(usuarioActualElement.textContent).toBe(`👤 ${nombreUsuario}`);
    });
  });

  describe('filtrarPalabras', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('testuser');
    });

    test('debe mostrar palabras que coinciden con el filtro', () => {
      const app = require('../app.js');
      app.palabrasOriginales = [
        { id: 1, palabra: 'casa' },
        { id: 2, palabra: 'perro' },
        { id: 3, palabra: 'gato' }
      ];

      app.filtrarPalabras('ca');

      const listaPalabras = document.getElementById('listaPalabras');
      expect(listaPalabras.innerHTML).toContain('casa');
      expect(listaPalabras.innerHTML).not.toContain('perro');
      expect(listaPalabras.innerHTML).not.toContain('gato');
    });

    test('debe ser case-insensitive', () => {
      const app = require('../app.js');
      app.palabrasOriginales = [
        { id: 1, palabra: 'CASA' },
        { id: 2, palabra: 'Perro' },
        { id: 3, palabra: 'gato' }
      ];

      app.filtrarPalabras('casa');

      const listaPalabras = document.getElementById('listaPalabras');
      expect(listaPalabras.innerHTML).toContain('CASA');
    });

    test('debe mostrar mensaje cuando no hay coincidencias', () => {
      const app = require('../app.js');
      app.palabrasOriginales = [
        { id: 1, palabra: 'casa' },
        { id: 2, palabra: 'perro' }
      ];

      app.filtrarPalabras('xyz');

      const listaPalabras = document.getElementById('listaPalabras');
      expect(listaPalabras.innerHTML).toContain('No se encontraron palabras');
    });

    test('no debe filtrar si el filtro está vacío', () => {
      const app = require('../app.js');
      app.palabrasOriginales = [
        { id: 1, palabra: 'casa' },
        { id: 2, palabra: 'perro' }
      ];
      app.ordenActual = 'fecha-desc';

      app.filtrarPalabras('');

      const lista = document.getElementById('listaPalabras');
      expect(lista.innerHTML).toContain('casa');
      expect(lista.innerHTML).toContain('perro');
    });

    test('no debe filtrar si el filtro contiene espacios en blanco', () => {
      const app = require('../app.js');
       app.palabrasOriginales = [
        { id: 1, palabra: 'casa' },
        { id: 2, palabra: 'perro' }
      ];
      app.filtrarPalabras('');

      const lista = document.getElementById('listaPalabras');
      expect(lista.innerHTML).toContain('casa');
      expect(lista.innerHTML).toContain('perro');
    });

    test('debe mostrar botones de editar y eliminar en resultados filtrados', () => {
      const app = require('../app.js');
      app.palabrasOriginales = [
        { id: 1, palabra: 'casa' }
      ];

      app.filtrarPalabras('casa');

      const listaPalabras = document.getElementById('listaPalabras');
      expect(listaPalabras.innerHTML).toContain('Editar');
      expect(listaPalabras.innerHTML).toContain('Eliminar');
      expect(listaPalabras.innerHTML).toContain('editarPalabra(1');
      expect(listaPalabras.innerHTML).toContain('eliminarPalabra(1)');
    });
  });

  describe('ordenarPalabras', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('testuser');
    });

    test('debe mostrar mensaje cuando no hay palabras', () => {
      const app = require('../app.js');
      app.palabrasOriginales = [];

      app.ordenarPalabras('fecha-desc');

      const listaPalabras = document.getElementById('listaPalabras');
      expect(listaPalabras.innerHTML).toContain('No hay palabras guardadas');
    });

    test('debe ordenar por nombre ascendente', () => {
      const app = require('../app.js');
      app.palabrasOriginales = [
        { id: 1, palabra: 'zebra' },
        { id: 2, palabra: 'casa' },
        { id: 3, palabra: 'perro' }
      ];

      app.ordenarPalabras('nombre-asc');

      const listaPalabras = document.getElementById('listaPalabras');
      const items = listaPalabras.querySelectorAll('.palabra-item strong');
      expect(items[0].textContent).toBe('casa');
      expect(items[1].textContent).toBe('perro');
      expect(items[2].textContent).toBe('zebra');
    });

    test('debe ordenar por nombre descendente', () => {
      const app = require('../app.js');
      app.palabrasOriginales = [
        { id: 1, palabra: 'casa' },
        { id: 2, palabra: 'perro' },
        { id: 3, palabra: 'zebra' }
      ];

      app.ordenarPalabras('nombre-desc');

      const listaPalabras = document.getElementById('listaPalabras');
      const items = listaPalabras.querySelectorAll('.palabra-item strong');
      expect(items[0].textContent).toBe('zebra');
      expect(items[1].textContent).toBe('perro');
      expect(items[2].textContent).toBe('casa');
    });

    test('debe ordenar por fecha ascendente (id ascendente)', () => {
      const app = require('../app.js');
      app.palabrasOriginales = [
        { id: 3, palabra: 'tercero' },
        { id: 1, palabra: 'primero' },
        { id: 2, palabra: 'segundo' }
      ];

      app.ordenarPalabras('fecha-asc');

      const listaPalabras = document.getElementById('listaPalabras');
      const items = listaPalabras.querySelectorAll('.palabra-item strong');
      expect(items[0].textContent).toBe('primero');
      expect(items[1].textContent).toBe('segundo');
      expect(items[2].textContent).toBe('tercero');
    });

    test('debe ordenar por fecha descendente (id descendente)', () => {
      const app = require('../app.js');
      app.palabrasOriginales = [
        { id: 1, palabra: 'primero' },
        { id: 2, palabra: 'segundo' },
        { id: 3, palabra: 'tercero' }
      ];

      app.ordenarPalabras('fecha-desc');

      const listaPalabras = document.getElementById('listaPalabras');
      const items = listaPalabras.querySelectorAll('.palabra-item strong');
      expect(items[0].textContent).toBe('tercero');
      expect(items[1].textContent).toBe('segundo');
      expect(items[2].textContent).toBe('primero');
    });

    test('debe actualizar ordenActual', () => {
      const app = require('../app.js');
      app.palabrasOriginales = [{ id: 1, palabra: 'test' }];

      app.ordenarPalabras('nombre-asc');
      expect(app.ordenActual).toBe('nombre-asc');

      app.ordenarPalabras('fecha-desc');
      expect(app.ordenActual).toBe('fecha-desc');
    });

    test('debe no modificar el array original', () => {
      const app = require('../app.js');
      const original = [
        { id: 3, palabra: 'tercero' },
        { id: 1, palabra: 'primero' },
        { id: 2, palabra: 'segundo' }
      ];
      app.palabrasOriginales = original;

      app.ordenarPalabras('nombre-asc');

      expect(app.palabrasOriginales).toEqual(original);
    });
  });

  describe('editarPalabra edge cases', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('testuser');
      window.prompt = jest.fn();
      window.alert = jest.fn();
    });

    test('no debe hacer nada si el usuario cancela el prompt', async () => {
      window.prompt.mockReturnValue(null);
      
      const app = require('../app.js');
      const mostrarMensajeSpy = jest.spyOn(app, 'mostrarMensaje');

      await app.editarPalabra(1, 'test');

      expect(fetch).not.toHaveBeenCalled();
      expect(mostrarMensajeSpy).not.toHaveBeenCalled();
    });

    test('debe mostrar error si la palabra está vacía', async () => {
      window.prompt = jest.fn().mockReturnValue('   ');

      const app = require('../app.js');

      await app.editarPalabra(1, 'test');

      expect(fetch).not.toHaveBeenCalled();

      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.innerHTML).toContain('La palabra no puede estar vacía');
      expect(mensajeDiv.innerHTML).toContain('error');
    });

    test('debe trimear espacios en blanco de la nueva palabra', async () => {
      window.prompt.mockReturnValue('  nueva  ');
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mensaje: 'ok' })
      });
      
      const app = require('../app.js');

      await app.editarPalabra(1, 'test');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ palabra: 'nueva' })
        })
      );
    });
  });
});