describe('Cancelación de borrado', () => {
  it('No borra la palabra si el usuario cancela la confirmación', () => {
    cy.visit('http://localhost:8080');

    // Espiar y forzar confirmación negativa
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false).as('confirmSpy');
    });

    // Contar cuántas palabras hay antes
    cy.get('#listaPalabras div').then(($itemsBefore) => {
      const cantidadAntes = $itemsBefore.length;

      // Intentar borrar
      cy.get('#listaPalabras div:nth-child(1) > button.delete-btn').click();

      // Verificar que se llamó a confirm
      cy.get('@confirmSpy').should('have.been.calledOnce');

      // Verificar que la cantidad de palabras no cambió
      cy.get('#listaPalabras div').should('have.length', cantidadAntes);
    });
  });
});