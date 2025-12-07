describe('Confirmación de borrado aceptada', () => {
  it('Elimina la palabra si el usuario confirma', () => {
    const palabra = `cypress-borrar-${Date.now()}`;

    // 1) Ir a la app
    cy.visit('/');

    // 2) Crear una palabra usando el formulario de la UI
    cy.get('#palabraInput')
      .clear()
      .type(palabra);

    cy.contains('button', 'Agregar').click();

    // 3) Verificar que la palabra aparece en la lista
    cy.contains('#listaPalabras .palabra-item', palabra, { timeout: 10000 })
      .should('exist');

    // 4) Stub de confirm para devolver "true"
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true).as('confirmSpy');
    });

    // 5) Clickear el botón "Eliminar" de ESA palabra
    cy.contains('#listaPalabras .palabra-item', palabra)
      .within(() => {
        cy.get('button.delete-btn').click();
      });

    // 6) Verificar que se llamó a confirm
    cy.get('@confirmSpy').should('have.been.calledOnce');

    // 7) Verificar que la palabra ya no existe
    cy.contains('#listaPalabras .palabra-item', palabra).should('not.exist');
  });
});
