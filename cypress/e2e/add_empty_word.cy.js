describe('Validación de palabra vacía', () => {
  it('No agrega palabra si el input está vacío', () => {
    cy.visit('/');

    // Login
    cy.get('#loginUsername').type('prueba');
    cy.get('#loginPassword').type('prueba');
    cy.get('#loginForm button').click();

    // Esperar a que exista el contenedor de la lista
    cy.get('#listaPalabras', { timeout: 10000 }).should('exist');

    // Contar cuántas palabras hay antes (puede ser 0)
    cy.get('#listaPalabras').then(($lista) => {
      const cantidadAntes = $lista.find('.palabra-item').length;

      // Asegurar input vacío
      cy.get('#palabraInput').clear();

      // Click en "Agregar" sin escribir nada
      cy.contains('button', 'Agregar').click();

      // Volver a leer la lista y contar de nuevo
      cy.get('#listaPalabras').then(($listaDespues) => {
        const cantidadDespues = $listaDespues.find('.palabra-item').length;
        expect(cantidadDespues).to.eq(cantidadAntes);
      });
    });
  });
});
