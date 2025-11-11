describe('Validación de palabra vacía', () => {
  it('No agrega palabra si el input está vacío', () => {
    cy.visit('http://localhost:8080');

    // Contar cuántas palabras hay antes
    cy.get('#listaPalabras div').then(($itemsBefore) => {
      const cantidadAntes = $itemsBefore.length;

      // Simular clic sin escribir nada
      cy.get('#palabraInput').clear(); // Asegura que esté vacío
      cy.get('div.form-group button').click();

      // Verificar que la cantidad de palabras no cambió
      cy.get('#listaPalabras div').should('have.length', cantidadAntes);
    });
  });
});