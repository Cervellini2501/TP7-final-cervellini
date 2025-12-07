describe('Cancelación de borrado', () => {
  it('No borra la palabra si el usuario cancela', () => {
    const palabra = `cypress-cancelar-${Date.now()}`;

    // Sincronizar con la API para evitar race en QA
    cy.intercept('POST', '**/api/palabras').as('crear');
    cy.intercept('GET', '**/api/palabras').as('listar');

    cy.visit('/');

    cy.get('#palabraInput').clear().type(palabra);
    cy.contains('button', 'Agregar').click();

    // Esperar POST y luego forzar refresco para obtener la lista actualizada
    cy.wait('@crear', { timeout: 20000 });
    cy.reload();
    cy.wait('@listar', { timeout: 20000 });

    cy.contains('#listaPalabras .palabra-item', palabra, { timeout: 20000 }).should('exist');

    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false).as('confirmSpy');
    });

    cy.contains('#listaPalabras .palabra-item', palabra).find('button.delete-btn').click();

    cy.get('@confirmSpy').should('have.been.calledOnce');
    cy.contains('#listaPalabras .palabra-item', palabra).should('exist');
  });
});