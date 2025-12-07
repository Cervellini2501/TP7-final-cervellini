describe('Cancelación de borrado', () => {
  it('No borra la palabra si el usuario cancela', () => {
    const palabra = `cypress-cancelar-${Date.now()}`;

    // Crear la palabra directamente por API para asegurar que exista
    cy.request('POST', '/api/palabras', { palabra });

    cy.visit('/');

    cy.contains('#listaPalabras .palabra-item', palabra, { timeout: 20000 }).should('exist');

    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false).as('confirmSpy');
    });

    cy.contains('#listaPalabras .palabra-item', palabra).find('button.delete-btn').click();

    cy.get('@confirmSpy').should('have.been.calledOnce');
    cy.contains('#listaPalabras .palabra-item', palabra).should('exist');
  });
});