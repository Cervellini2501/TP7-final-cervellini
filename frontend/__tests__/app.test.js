describe('Frontend - Gestión de Palabras (Unitarios)', () => {
  let appFunctions;
  let mockFetch;

  beforeEach(() => {
    // Resetear el DOM antes de cada test
    document.body.innerHTML = `
      <input id="palabraInput" value="" />
      <div id="listaPalabras"></div>
      <div id="mensaje"></div>
    `;

    // Mock de fetch local
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    // Mockear console.error para tests de error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Importar funciones
    appFunctions = require('../app.js');
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
      // ARRANGE
      jest.useFakeTimers();

      // ACT
      appFunctions.mostrarMensaje('Hola', 'exito');
      jest.runAllTimers();

      // ASSERT
      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.innerHTML).toBe('');
      
      jest.useRealTimers();
    });
  });

  describe('cargarPalabras()', () => {
    test('debería cargar y mostrar palabras correctamente', async () => {
      // ARRANGE
      const mockPalabras = [
        { id: 1, palabra: 'casa' },
        { id: 2, palabra: 'perro' }
      ];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPalabras
      });

      // ACT
      await appFunctions.cargarPalabras();

      // ASSERT
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const listaPalabras = document.getElementById('listaPalabras');
      expect(listaPalabras.innerHTML).toContain('casa');
      expect(listaPalabras.innerHTML).toContain('perro');
    });

    test('debería mostrar mensaje cuando no hay palabras', async () => {
      // ARRANGE
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      // ACT
      await appFunctions.cargarPalabras();

      // ASSERT
      const listaPalabras = document.getElementById('listaPalabras');
      expect(listaPalabras.innerHTML).toContain('No hay palabras guardadas');
    });

    test('debería manejar errores de la API', async () => {
      // ARRANGE
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

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
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 3, palabra: 'gato', mensaje: 'Palabra agregada exitosamente' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: 3, palabra: 'gato' }]
        });

      // ACT
      await appFunctions.agregarPalabra();

      // ASSERT
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
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
      expect(mockFetch).not.toHaveBeenCalled();
      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.innerHTML).toContain('Por favor ingresa una palabra');
    });

    test('debería manejar errores de la API al agregar', async () => {
      // ARRANGE
      const palabraInput = document.getElementById('palabraInput');
      palabraInput.value = 'test';
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Error de servidor' })
      });

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
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ mensaje: 'Palabra eliminada exitosamente' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      // ACT
      await appFunctions.eliminarPalabra(1);

      // ASSERT
      expect(window.confirm).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
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
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('debería manejar errores al eliminar', async () => {
      // ARRANGE
      window.confirm = jest.fn(() => true);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Error al eliminar' })
      });

      // ACT
      await appFunctions.eliminarPalabra(1);

      // ASSERT
      const mensajeDiv = document.getElementById('mensaje');
      expect(mensajeDiv.innerHTML).toContain('Error');
    });
  });
});