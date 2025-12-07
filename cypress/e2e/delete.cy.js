// cypress/e2e/delete.cy.js
describe('Confirmación de borrado aceptada', () => {
  it('Elimina la palabra si el usuario confirma', () => {
    const palabraABorrar = 'cypress-borrar';

    // Crear la palabra por API para asegurar que exista
    cy.request('POST', '/api/palabras', { palabra: palabraABorrar });

    cy.visit('/');

    // Esperar la palabra en la lista
    cy.get('#listaPalabras', { timeout: 15000 }).should('exist');
    cy.contains('#listaPalabras .palabra-item', palabraABorrar, { timeout: 15000 })
      .as('itemABorrar');

    // Stub de confirm en true
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true).as('confirmSpy');
    });

    // Click en eliminar
    cy.get('@itemABorrar').find('button.delete-btn').click();

    // Se llamó a confirm
    cy.get('@confirmSpy').should('have.been.calledOnce');

    // La palabra ya no está
    cy.contains('#listaPalabras .palabra-item', palabraABorrar).should('not.exist');
  });
});
