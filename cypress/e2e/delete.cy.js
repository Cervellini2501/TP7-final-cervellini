describe('Confirmación de borrado aceptada', () => {
  it('Elimina la palabra si el usuario confirma', () => {
    cy.visit('http://localhost:8080');

    // Espiar y forzar confirmación positiva
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true).as('confirmSpy');
    });

    // Contar cuántas palabras hay antes
    cy.get('#listaPalabras div').then(($itemsBefore) => {
      const cantidadAntes = $itemsBefore.length;

      // Disparar el clic en el botón de borrar
      cy.get('#listaPalabras div:nth-child(1) > button.delete-btn').click();

      // Verificar que se llamó a confirm
      cy.get('@confirmSpy').should('have.been.calledOnce');

      // Verificar que la cantidad de palabras disminuyó en 1
      cy.get('#listaPalabras div').should('have.length', cantidadAntes - 1);
    });
  });
});