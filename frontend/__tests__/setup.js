// Mock del fetch global
global.fetch = require('jest-fetch-mock');
fetch.enableMocks();

// Resetear DOM y mocks antes de cada test
beforeEach(() => {
  document.body.innerHTML = `
    <input id="palabraInput" />
    <div id="listaPalabras"></div>
    <div id="mensaje"></div>
  `;

  fetch.resetMocks();
  global.console.error = jest.fn(); // limpiar errores entre tests
});

// Mock de window.location para que API_URL siempre sea "http://localhost/api"
delete window.location;
window.location = new URL("http://localhost");
