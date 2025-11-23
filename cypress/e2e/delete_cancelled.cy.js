describe('Cancelación de borrado', () => {
  it('No borra la palabra si el usuario cancela la confirmación', () => {
    cy.visit('http://localhost:8080'); // Colocar la url local o de Azure de nuestro front
      cy.get('#loginUsername').click();
      cy.get('#loginUsername').type('prueba');
      cy.get('#loginPassword').click();
      cy.get('#loginPassword').type('prueba');
      cy.get('#loginForm button').click();
      
    // Esperar a que el contenedor de palabras exista y un pequeño buffer antes de contar
    cy.get('#listaPalabras', { timeout: 10000 }).should('exist');
    cy.wait(1000); // <-- tiempo de espera agregado

    // Espiar y forzar confirmación negativa
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false).as('confirmSpy');
    });

    // Contar cuántas palabras hay antes
    cy.get('#listaPalabras .palabra-item').then(($itemsBefore) => {
      const cantidadAntes = $itemsBefore.length;

      // Intentar borrar
      cy.get('#listaPalabras .palabra-item:first-child .delete-btn', { timeout: 5000 }).click();

      // Verificar que se llamó a confirm
      cy.get('@confirmSpy').should('have.been.calledOnce');

      // Verificar que la cantidad de palabras no cambió
      cy.get('#listaPalabras .palabra-item').should('have.length', cantidadAntes);
    });
  });
});