// cypress/e2e/delete_cancelled.cy.js
describe('Cancelación de borrado', () => {
  it('No borra la palabra si el usuario cancela la confirmación', () => {
    const palabraPersistente = 'palabra-que-no-debe-borrarse-ci';

    // 1) Crear una palabra específica para este test (vía API)
    cy.request('POST', '/api/palabras', { palabra: palabraPersistente });

    // 2) Visitar la app
    cy.visit('/');

    // 3) Asegurar que la lista y la palabra existan
    cy.get('#listaPalabras', { timeout: 10000 }).should('exist');
    cy.contains('#listaPalabras .palabra-item', palabraPersistente, { timeout: 10000 })
      .as('itemObjetivo');

    // 4) Stub de confirm para que devuelva "false" (usuario cancela)
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false).as('confirmSpy');
    });

    // 5) Click en el botón Eliminar de ESA palabra
    cy.get('@itemObjetivo').find('button.delete-btn').click();

    // 6) Verificar que se llamó a confirm
    cy.get('@confirmSpy').should('have.been.calledOnce');

    // 7) Verificar que la palabra SIGUE existiendo
    cy.contains('#listaPalabras .palabra-item', palabraPersistente).should('exist');
  });
});
