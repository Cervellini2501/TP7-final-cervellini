describe('Agregar palabra', () => {
  it('Agrega una palabra correctamente', () => {
    cy.visit('/');
    cy.get('title').should('contain', 'Palabras');
    cy.get('#palabraInput').click();
    cy.get('#palabraInput').type('bauti');
    cy.get('div.form-group button').click();
  });
});