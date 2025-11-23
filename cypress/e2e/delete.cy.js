describe('Confirmación de borrado aceptada', () => {
  it('Elimina la palabra si el usuario confirma', () => {
    cy.visit('/'); // Usa baseUrl del config
      cy.get('#loginUsername').click();
      cy.get('#loginUsername').type('prueba');
      cy.get('#loginPassword').click();
      cy.get('#loginPassword').type('prueba');
      cy.get('#loginForm button').click();

    // Esperar a que el contenedor de palabras exista y un pequeño buffer antes de contar
    cy.get('#listaPalabras', { timeout: 10000 }).should('exist');
    cy.wait(1000); // <-- tiempo de espera agregado

    // Espiar y forzar confirmación positiva
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true).as('confirmSpy');
    });

    // Contar cuántas palabras hay antes
    cy.get('#listaPalabras .palabra-item').then(($itemsBefore) => {
      const cantidadAntes = $itemsBefore.length;

      // Disparar el clic en el botón de borrar
      cy.get('#listaPalabras .palabra-item:first-child .delete-btn', { timeout: 5000 }).click();

      // Verificar que se llamó a confirm
      cy.get('@confirmSpy').should('have.been.calledOnce');

      // Verificar que la cantidad de palabras disminuyó en 1
      cy.get('#listaPalabras .palabra-item').should('have.length', cantidadAntes - 1);
    });
  });
});