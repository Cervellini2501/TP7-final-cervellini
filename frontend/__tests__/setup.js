// Mock del fetch global
global.fetch = require('jest-fetch-mock');

// Crea elementos HTML básicos del DOM (inputs, divs) que tu código necesita
document.body.innerHTML = `
  <input id="palabraInput" />
  <div id="listaPalabras"></div>
  <div id="mensaje"></div>
`;

// Mock de window.location - Configuración completa
delete window.location;
window.location = new URL('http://localhost');

// Mock de console.error para tests más limpios
global.console.error = jest.fn();