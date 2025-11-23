describe('Validación de palabra vacía', () => {
  it('No agrega palabra si el input está vacío', () => {
    cy.visit('https://palabras-qa-gebud8fdgxejeyen.brazilsouth-01.azurewebsites.net'); // Colocar la url local o de Azure de nuestro front
      cy.get('#loginUsername').click();
      cy.get('#loginUsername').type('prueba');
      cy.get('#loginPassword').click();
      cy.get('#loginPassword').type('prueba');
      cy.get('#loginForm button').click();

    // Esperar a que el contenedor de palabras exista y un pequeño buffer antes de contar
    cy.get('#listaPalabras', { timeout: 10000 }).should('exist');
    cy.wait(1000); // <-- tiempo de espera agregado

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