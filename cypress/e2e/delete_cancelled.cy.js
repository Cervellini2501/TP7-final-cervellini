// cypress/e2e/delete_cancelled.cy.js
describe('Cancelación de borrado', () => {
  it('No borra la palabra si el usuario cancela la confirmación', () => {
    const palabraPersistente = 'cypress-cancelar';

    // Crear la palabra por API para asegurar que exista
    cy.request('POST', '/api/palabras', { palabra: palabraPersistente });

    cy.visit('/');

    // Esperar la palabra en la lista
    cy.get('#listaPalabras', { timeout: 15000 }).should('exist');
    cy.contains('#listaPalabras .palabra-item', palabraPersistente, { timeout: 15000 })
      .as('itemObjetivo');

    // Stub de confirm en false (usuario cancela)
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false).as('confirmSpy');
    });

    // Click en eliminar
    cy.get('@itemObjetivo').find('button.delete-btn').click();

    // Se llamó a confirm
    cy.get('@confirmSpy').should('have.been.calledOnce');

    // La palabra sigue existiendo
    cy.contains('#listaPalabras .palabra-item', palabraPersistente).should('exist');
  });
});
