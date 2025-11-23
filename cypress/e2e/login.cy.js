describe('Login de usuario', () => {
  it('Permite ingresar con credenciales correctas', () => {
    cy.intercept('POST', '/api/login').as('loginUser'); // Intercepta la solicitud de login
    cy.visit('http://localhost:8080'); // Colocar la url local o de Azure de nuestro front
    cy.get('#loginUsername').click();
    cy.get('#loginUsername').type('prueba'); // Credenciales correctas
    cy.get('#loginPassword').click();
    cy.get('#loginPassword').type('prueba');
    cy.get('#loginForm button').click();
    // Verifica que la solicitud devuelva un 200
    cy.wait('@loginUser').its('response.statusCode').should('eq', 200);
    // Verifica que se redirija o muestre mensaje de éxito
    cy.get('#mensaje')
    .should('be.visible')
    .and('contain', 'Login exitoso')
    .and('have.class', 'exito');
  });

  it('No permite ingresar con credenciales incorrectas', () => {
    cy.intercept('POST', '/api/login').as('loginUser'); // Intercepta la solicitud de login
    cy.visit('http://localhost:8080');
    cy.get('#loginUsername').click();
    cy.get('#loginUsername').type('usuarioInvalido'); // Credenciales incorrectas
    cy.get('#loginPassword').click();
    cy.get('#loginPassword').type('passwordInvalido');
    cy.get('#loginForm button').click();
    // Verifica que la solicitud devuelva un 401
    cy.wait('@loginUser').its('response.statusCode').should('eq', 401);
    // Verifica que se muestre mensaje de error
    cy.get('#mensaje')
    .should('be.visible')
    .and('contain', 'Usuario o contraseña incorrectos')
    .and('have.class', 'error');
  });
});