describe('Cancelación de borrado', () => {
  it('No borra la palabra si el usuario cancela la confirmación', () => {
    const palabra = `cypress-cancelar-${Date.now()}`;

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

    // 4) Stub de confirm para devolver "false"
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false).as('confirmSpy');
    });

    // 5) Clickear el botón "Eliminar" de ESA palabra
    cy.contains('#listaPalabras .palabra-item', palabra)
      .within(() => {
        cy.get('button.delete-btn').click();
      });

    // 6) Verificar que se llamó a confirm
    cy.get('@confirmSpy').should('have.been.calledOnce');

    // 7) Verificar que la palabra SIGUE existiendo
    cy.contains('#listaPalabras .palabra-item', palabra).should('exist');
  });
});
