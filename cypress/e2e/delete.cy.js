describe('Confirmación de borrado aceptada', () => {
  it('Elimina la palabra si el usuario confirma', () => {
    const palabra = `cypress-borrar-${Date.now()}`;

    // Crear la palabra directamente por API para asegurar que exista
    cy.request('POST', '/api/palabras', { palabra });

    cy.visit('/');

    // Verificar que la palabra aparece en la lista
    cy.contains('#listaPalabras .palabra-item', palabra, { timeout: 20000 })
      .should('exist');

    // Stub confirm en true
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true).as('confirmSpy');
    });

    // Click eliminar de esa palabra
    cy.contains('#listaPalabras .palabra-item', palabra).find('button.delete-btn').click();

    cy.get('@confirmSpy').should('have.been.calledOnce');
    cy.contains('#listaPalabras .palabra-item', palabra).should('not.exist');
  });
});