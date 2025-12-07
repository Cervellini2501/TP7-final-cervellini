describe('Confirmación de borrado aceptada', () => {
  it('Elimina la palabra si el usuario confirma', () => {
    const palabra = `cypress-borrar-${Date.now()}`;

    // Sincronizar con la API para evitar race en QA
    cy.intercept('POST', '**/api/palabras').as('crear');
    cy.intercept('GET', '**/api/palabras').as('listar');

    cy.visit('/');

    // Crear palabra vía UI
    cy.get('#palabraInput').clear().type(palabra);
    cy.contains('button', 'Agregar').click();

    // Esperar POST y luego forzar refresco para obtener la lista actualizada
    cy.wait('@crear', { timeout: 20000 });
    cy.reload();
    cy.wait('@listar', { timeout: 20000 });

    // Verificar que la palabra aparece en la lista (sin depender del mensaje)
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