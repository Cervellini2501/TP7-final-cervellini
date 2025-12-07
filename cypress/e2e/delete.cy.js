describe('Confirmación de borrado aceptada', () => {
  it('Elimina la palabra si el usuario confirma', () => {
    const palabra = `cypress-borrar-${Date.now()}`;

    cy.visit('/');

    // Crear palabra vía UI
    cy.get('#palabraInput').clear().type(palabra);
    cy.contains('button', 'Agregar').click();

    // Esperar que aparezca
      // Esperar confirmación visual antes de buscar en la lista (latencia QA)
      cy.contains('.mensaje', 'exitosamente', { timeout: 15000 }).should('exist');

      // 3) Verificar que la palabra aparece en la lista
      cy.contains('#listaPalabras .palabra-item', palabra, { timeout: 20000 })
        .should('exist');

    // Stub confirm en true
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true).as('confirmSpy');
    });

    // Click eliminar de esa palabra
    cy.contains('#listaPalabras .palabra-item', palabra).find('button.delete-btn').click();

    cy.get('@confirmSpy').should('have.been.calledOnce');
    cy.contains('#listaPalabras .palabra-item', palabra).should('not.exist');
  });
});