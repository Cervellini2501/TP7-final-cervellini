describe('Agregar palabra', () => {
  it('Registra usuario correctamente', () => {
    const uniqueUsername = `testprueba_${Date.now()}`; // Genera un nombre único con timestamp
    cy.intercept('POST', '/api/register').as('registerUser'); // Intercepta la solicitud de registro
    cy.visit('http://localhost:8080'); // Colocar la url local o de Azure de nuestro front
    cy.get('title').should('contain', 'Palabras'); // Verifica que el título contenga 'Palabras'
    cy.get('#registerUsername').click();
    cy.get('#registerUsername').type(uniqueUsername); // Usa el nombre único
    cy.get('#registerPassword').click();
    cy.get('#registerPassword').type('testprueba');
    cy.get('#registerForm button').click();
    // Verifica que la solicitud devuelva un 200
    cy.wait('@registerUser').its('response.statusCode').should('eq', 200);
    cy.get('#mensaje')
    .should('be.visible')
    .and('contain', 'Usuario registrado exitosamente')
    .and('have.class', 'exito');
  });

  it('No permite registrar un usuario ya existente', () => {
    const existingUsername = 'prueba'; // Usa un nombre que ya esté en la BD
    cy.intercept('POST', '/api/register').as('registerUser'); // Intercepta la solicitud de registro
    cy.visit('http://localhost:8080');
    cy.get('title').should('contain', 'Palabras');
    cy.get('#registerUsername').click();
    cy.get('#registerUsername').type(existingUsername);
    cy.get('#registerPassword').click();
    cy.get('#registerPassword').type('prueba');
    cy.get('#registerForm button').click();
    // Verifica que la solicitud devuelva un 400
    cy.wait('@registerUser').its('response.statusCode').should('eq', 400);
    cy.get('#mensaje')
    .should('be.visible')
    .and('contain', 'El usuario ya existe')
    .and('have.class', 'error');
  });
});