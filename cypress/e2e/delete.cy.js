describe('Confirmación de borrado aceptada', () => {
  it('Elimina la palabra si el usuario confirma', () => {
    cy.visit('/');

    // 1) Crear una palabra específica para este test
    cy.get('#palabraInput', { timeout: 10000 }).should('exist').type('cypress-borrar{enter}');

    // Esperar a que aparezca en la lista
    cy.get('#listaPalabras .palabra-item', { timeout: 10000 })
      .contains('cypress-borrar')
      .should('exist');

    // 2) Stub de confirm en true
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true).as('confirmSpy');
    });

    // 3) Ver cuántos items había antes
    cy.get('#listaPalabras .palabra-item').then(($itemsAntes) => {
      const cantidadAntes = $itemsAntes.length;

      // 4) Click en el botón eliminar de la palabra creada
      cy.contains('#listaPalabras .palabra-item', 'cypress-borrar')
        .find('button.delete-btn')
        .click();

      // 5) Se llamó a confirm
      cy.get('@confirmSpy').should('have.been.calledOnce');

      // 6) La palabra ya no está y la cantidad bajó en 1
      cy.get('#listaPalabras .palabra-item')
        .should('have.length', cantidadAntes - 1)
        .should('not.contain.text', 'cypress-borrar');
    });
  });
});
