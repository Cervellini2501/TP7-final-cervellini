describe('Ordenar palabras', () => {
  it('Ordena palabras en orden ascendente', () => {
    // Verifica que las palabras se ordenen alfabéticamente de A a Z
    cy.visit('https://palabras-qa-gebud8fdgxejeyen.brazilsouth-01.azurewebsites.net'); // Colocar la url local o de Azure de nuestro front
    cy.get('#loginUsername').click();
    cy.get('#loginUsername').type('prueba');
    cy.get('#loginPassword').click();
    cy.get('#loginPassword').type('prueba');
    cy.get('#loginForm button').click();
    cy.get('#ordenSelect').select('nombre-asc');

    // Espera explícita para asegurarse de que las palabras se carguen
    cy.get('.palabra-item', { timeout: 10000 }).should('exist'); // Espera hasta 10 segundos

    // Comprobación de que las palabras están ordenadas de A a Z
    cy.get('.palabra-item').then(($palabras) => {
      const textos = [...$palabras].map((el) => el.textContent.trim());
      const ordenado = [...textos].sort(); // Orden esperado
      expect(textos).to.deep.equal(ordenado);
    });
  });

  it('Ordena palabras en orden descendente', () => {
    // Verifica que las palabras se ordenen alfabéticamente de Z a A
    cy.visit('https://palabras-qa-gebud8fdgxejeyen.brazilsouth-01.azurewebsites.net'); // Colocar la url local o de Azure de nuestro front
    cy.get('#loginUsername').click();
    cy.get('#loginUsername').type('prueba');
    cy.get('#loginPassword').click();
    cy.get('#loginPassword').type('prueba');
    cy.get('#loginForm button').click();
    cy.get('#ordenSelect').select('nombre-desc');

    // Espera explícita para asegurarse de que las palabras se carguen
    cy.get('.palabra-item', { timeout: 10000 }).should('exist'); // Espera hasta 10 segundos

    // Comprobación de que las palabras están ordenadas de Z a A
    cy.get('.palabra-item').then(($palabras) => {
      const textos = [...$palabras].map((el) => el.textContent.trim());
      const ordenado = [...textos].sort().reverse(); // Orden esperado
      expect(textos).to.deep.equal(ordenado);
    });
  });
});

