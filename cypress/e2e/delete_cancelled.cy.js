// cypress/e2e/delete_cancelled.cy.js

describe('Cancelación de borrado', () => {
  it('No borra la palabra si el usuario cancela la confirmación', () => {
    const palabra = `Test Cypress Cancelar ${Date.now()}`;

    // 1) Precondición: crear la palabra directamente por API
    cy.request('POST', '/api/palabras', { palabra });

    // 2) Ir al frontend
    cy.visit('/');

    // 3) Esperar a que la palabra aparezca en la lista
    cy.contains('#listaPalabras .palabra-item', palabra, { timeout: 10000 })
      .should('exist');

    // 4) Stub de window.confirm para que el usuario "cancele"
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false).as('confirmStub');
    });

    // 5) Hacer click en el botón Eliminar de esa palabra
    cy.contains('#listaPalabras .palabra-item', palabra)
      .find('button.delete-btn')
      .click();

    // 6) Verificar que se llamó a confirm
    cy.get('@confirmStub').should('have.been.calledOnce');

    // 7) Como el usuario canceló, la palabra debe seguir en la lista
    cy.contains('#listaPalabras .palabra-item', palabra)
      .should('exist');
  });
});
