describe('Cancelación de borrado', () => {
  it('No borra la palabra si el usuario cancela la confirmación', () => {
    cy.visit('/');

    // 1) Crear una palabra específica para este test
    cy.get('#palabraInput', { timeout: 10000 }).should('exist').type('cypress-cancelar{enter}');

    // Esperar a que aparezca en la lista
    cy.get('#listaPalabras .palabra-item', { timeout: 10000 })
      .contains('cypress-cancelar')
      .should('exist');

    // 2) Stub de confirm en false
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false).as('confirmSpy');
    });

    // 3) Ver cuántos items había antes
    cy.get('#listaPalabras .palabra-item').then(($itemsAntes) => {
      const cantidadAntes = $itemsAntes.length;

      // 4) Click en el botón eliminar de la palabra creada
      cy.contains('#listaPalabras .palabra-item', 'cypress-cancelar')
        .find('button.delete-btn')
        .click();

      // 5) Se llamó a confirm
      cy.get('@confirmSpy').should('have.been.calledOnce');

      // 6) La palabra sigue estando y la cantidad NO cambia
      cy.get('#listaPalabras .palabra-item')
        .should('have.length', cantidadAntes)
        .should('contain.text', 'cypress-cancelar');
    });
  });
});
