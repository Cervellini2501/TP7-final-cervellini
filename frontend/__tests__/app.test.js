// Mock de fetch antes de importar app.js
global.fetch = require('jest-fetch-mock');
fetch.enableMocks();

describe('Frontend - Gestión de Palabras', () => {
  let appFunctions;

  beforeEach(() => {
    // Resetear el DOM antes de cada test
    document.body.innerHTML = `
      <input id="palabraInput" value="" />
      <div id="listaPalabras"></div>
      <div id="mensaje"></div>
    `;

    // Resetear mocks
    fetch.resetMocks();
    
    // Importar funciones
    appFunctions = require('../app.js');
  });

  describe('mostrarMensaje()', () => {
    test('debería mostrar mensaje de éxito', () => {
      // ARRANGE
      const mensaje = 'Operación exitosa';
      const tipo = 'exito';

      // ACT
      appFunctions.mostrarMensaje(mensaje, tipo);

      // ASSERT
      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.innerHTML).toContain(mensaje);
      expect(mensajeDiv.innerHTML).toContain('exito');
    });

    test('debería mostrar mensaje de error', () => {
      // ARRANGE
      const mensaje = 'Ocurrió un error';
      const tipo = 'error';

      // ACT
      appFunctions.mostrarMensaje(mensaje, tipo);

      // ASSERT
      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.innerHTML).toContain(mensaje);
      expect(mensajeDiv.innerHTML).toContain('error');
    });

    
    test('debería limpiar el mensaje después de 3 segundos', () => {
      jest.useFakeTimers();
      appFunctions.mostrarMensaje('Hola', 'exito');
      jest.runAllTimers();
      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.innerHTML).toBe('');
    });
  });

  describe('cargarPalabras()', () => {
    test('debería cargar y mostrar palabras correctamente', async () => {
      // ARRANGE
      const mockPalabras = [
        { id: 1, palabra: 'casa' },
        { id: 2, palabra: 'perro' }
      ];
      
      fetch.mockResponseOnce(JSON.stringify(mockPalabras));

      // ACT
      await appFunctions.cargarPalabras();

      // ASSERT
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/palabras');
      const listaPalabras = document.getElementById('listaPalabras');
      expect(listaPalabras.innerHTML).toContain('casa');
      expect(listaPalabras.innerHTML).toContain('perro');
      console.log(fetch.mock.calls);
    });

    test('debería mostrar mensaje cuando no hay palabras', async () => {
      // ARRANGE
      fetch.mockResponseOnce(JSON.stringify([]));

      // ACT
      await appFunctions.cargarPalabras();

      // ASSERT
      const listaPalabras = document.getElementById('listaPalabras');
      expect(listaPalabras.innerHTML).toContain('No hay palabras guardadas');
    });

    test('debería manejar errores de la API', async () => {
      // ARRANGE
      fetch.mockReject(new Error('Network error'));

      // ACT
      await appFunctions.cargarPalabras();

      // ASSERT
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('agregarPalabra()', () => {
    test('debería agregar una palabra exitosamente', async () => {
      // ARRANGE
      const palabraInput = document.getElementById('palabraInput');
      palabraInput.value = 'gato';
      
      fetch.mockResponses(
        [JSON.stringify({ id: 3, palabra: 'gato', mensaje: 'Palabra agregada exitosamente' }), { status: 200 }],
        [JSON.stringify([{ id: 3, palabra: 'gato' }]), { status: 200 }]
      );

      // ACT
      await appFunctions.agregarPalabra();

      // ASSERT
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/palabras',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ palabra: 'gato' })
        })
      );
      expect(palabraInput.value).toBe(''); // Input limpiado
    });

    test('debería validar que la palabra no esté vacía', async () => {
      // ARRANGE
      const palabraInput = document.getElementById('palabraInput');
      palabraInput.value = '   '; // Espacios en blanco

      // ACT
      await appFunctions.agregarPalabra();

      // ASSERT
      expect(fetch).not.toHaveBeenCalled();
      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.innerHTML).toContain('Por favor ingresa una palabra');
    });

    test('debería manejar errores de la API al agregar', async () => {
      // ARRANGE
      const palabraInput = document.getElementById('palabraInput');
      palabraInput.value = 'test';
      
      fetch.mockResponseOnce(
        JSON.stringify({ error: 'Error de servidor' }), 
        { status: 500 }
      );

      // ACT
      await appFunctions.agregarPalabra();

      // ASSERT
      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.innerHTML).toContain('Error');
    });
  });

  describe('eliminarPalabra()', () => {
    test('debería eliminar una palabra con confirmación', async () => {
      // ARRANGE
      window.confirm = jest.fn(() => true); // Usuario confirma
      
      fetch.mockResponses(
        [JSON.stringify({ mensaje: 'Palabra eliminada exitosamente' }), { status: 200 }],
        [JSON.stringify([]), { status: 200 }]
      );

      // ACT
      await appFunctions.eliminarPalabra(1);

      // ASSERT
      expect(window.confirm).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/palabras/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    test('NO debería eliminar si el usuario cancela', async () => {
      // ARRANGE
      window.confirm = jest.fn(() => false); // Usuario cancela

      // ACT
      await appFunctions.eliminarPalabra(1);

      // ASSERT
      expect(window.confirm).toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });

    test('debería manejar errores al eliminar', async () => {
      // ARRANGE
      window.confirm = jest.fn(() => true);
      fetch.mockResponseOnce(
        JSON.stringify({ error: 'Error al eliminar' }), 
        { status: 500 }
      );

      // ACT
      await appFunctions.eliminarPalabra(1);

      // ASSERT
      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.innerHTML).toContain('Error');
    });
  });
});