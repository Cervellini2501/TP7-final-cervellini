describe('Cancelación de borrado', () => {
  it('No borra la palabra si el usuario cancela la confirmación', () => {
    cy.visit('/');

    // Login
    cy.get('#loginUsername').type('prueba');
    cy.get('#loginPassword').type('prueba');
    cy.get('#loginForm button').click();

    // Esperar a que cargue la lista
    cy.get('#listaPalabras', { timeout: 10000 }).should('exist');

    // 🔹 Asegurarse de que exista al menos UNA palabra
    cy.get('#palabraInput').clear().type('palabra para borrar');
    cy.contains('button', 'Agregar').click();

    // Esperar a que aparezca al menos un item
    cy.get('#listaPalabras .palabra-item', { timeout: 10000 })
      .should('have.length.at.least', 1);

    // Espiar y forzar confirmación negativa
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false).as('confirmSpy');
    });

    // Contar cuántas palabras hay antes
    cy.get('#listaPalabras .palabra-item').then(($itemsBefore) => {
      const cantidadAntes = $itemsBefore.length;

      // Intentar borrar la primera
      cy.get('#listaPalabras .palabra-item:first .delete-btn').click();

      // Verificar que se llamó a confirm
      cy.get('@confirmSpy').should('have.been.calledOnce');

      // Verificar que la cantidad de palabras NO cambió
      cy.get('#listaPalabras .palabra-item')
        .should('have.length', cantidadAntes);
    });
  });
});
