describe('Agregar palabra', () => {
   it('Agrega una palabra correctamente', () => {
      cy.visit('/'); // Usa baseUrl del config
      cy.get('#loginUsername').click();
      cy.get('#loginUsername').type('prueba');
      cy.get('#loginPassword').click();
      cy.get('#loginPassword').type('prueba');
      cy.get('#loginForm button').click();
      cy.get('#palabraInput').click();
      cy.get('#palabraInput').type('bauti');
      cy.get('div.form-group button').click();

      // Verifica que la palabra se haya agregado a la lista
      cy.get('.palabra-item').should('contain', 'bauti'); // Asegúrate de que el selector sea correcto
   });
});