describe('Filtrar palabras', () => {
  it('Filtra palabras correctamente', () => {
    cy.visit('/'); // Usa baseUrl del config
    cy.get('#loginUsername').click();
    cy.get('#loginUsername').type('prueba');
    cy.get('#loginPassword').click();
    cy.get('#loginPassword').type('prueba');
    cy.get('#loginForm button').click();
    cy.get('#filtroInput').click();
    cy.get('#filtroInput').type('a');

    // Comprobación de que solo se muestran palabras que contienen la letra "a"
    cy.get('.palabra-item').each(($palabra) => {
      const texto = $palabra.text().toLowerCase();
      expect(texto).to.include('a'); // Verifica que cada palabra visible contiene "a"
    });
  });

  it('Muestra todas las palabras cuando el filtro está vacío', () => {
    cy.visit('/'); // Usa baseUrl del config
    cy.get('#loginUsername').click();
    cy.get('#loginUsername').type('prueba');
    cy.get('#loginPassword').click();
    cy.get('#loginPassword').type('prueba');
    cy.get('#loginForm button').click();
    cy.get('#filtroInput').clear(); // Asegura que el filtro esté vacío

    // Comprobación de que todas las palabras están visibles
    cy.get('.palabra-item').should('have.length.greaterThan', 0); // Verifica que hay palabras visibles
  });
});
