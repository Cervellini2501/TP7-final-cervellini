// cypress/e2e/delete.cy.js
describe('Confirmación de borrado aceptada', () => {
  it('Elimina la palabra si el usuario confirma', () => {
    const palabraABorrar = 'palabra-para-borrar-ci';

    // 1) Crear una palabra específica para este test (vía API)
    cy.request('POST', '/api/palabras', { palabra: palabraABorrar });

    // 2) Visitar la app
    cy.visit('/');

    // 3) Asegurar que la lista y la palabra existan
    cy.get('#listaPalabras', { timeout: 10000 }).should('exist');
    cy.contains('#listaPalabras .palabra-item', palabraABorrar, { timeout: 10000 })
      .as('itemABorrar');

    // 4) Stub de confirm para que devuelva "true"
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true).as('confirmSpy');
    });

    // 5) Click en el botón Eliminar de ESA palabra
    cy.get('@itemABorrar').find('button.delete-btn').click();

    // 6) Verificar que se llamó a confirm
    cy.get('@confirmSpy').should('have.been.calledOnce');

    // 7) Verificar que la palabra YA NO está en la lista
    cy.contains('#listaPalabras .palabra-item', palabraABorrar).should('not.exist');
  });
});
