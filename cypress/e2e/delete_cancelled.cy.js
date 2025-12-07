describe('Cancelación de borrado', () => {
  it('No borra la palabra si el usuario cancela', () => {
    const palabra = `cypress-cancelar-${Date.now()}`;

    cy.visit('/');

    cy.get('#palabraInput').clear().type(palabra);
    cy.contains('button', 'Agregar').click();

    cy.contains('#listaPalabras .palabra-item', palabra, { timeout: 15000 }).should('exist');

    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false).as('confirmSpy');
    });

    cy.contains('#listaPalabras .palabra-item', palabra).find('button.delete-btn').click();

    cy.get('@confirmSpy').should('have.been.calledOnce');
    cy.contains('#listaPalabras .palabra-item', palabra).should('exist');
  });
});