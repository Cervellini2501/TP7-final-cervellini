describe('Validación de palabra vacía', () => {
  it('No agrega palabra si el input está vacío', () => {
    cy.visit('/'); // baseUrl viene del config

    // Login
    cy.get('#loginUsername').type('prueba');
    cy.get('#loginPassword').type('prueba');
    cy.get('#loginForm button').click();

    // 1) Limpiar todas las palabras existentes del usuario en la API
    cy.request('GET', '/api/palabras').then((res) => {
      res.body.forEach((p) => {
        cy.request('DELETE', `/api/palabras/${p.id}`);
      });
    });

    // 2) Recargar la página para que la UI se sincronice con la lista vacía
    cy.reload();

    // 3) Esperar a que termine la carga (que desaparezca el "Cargando...")
    cy.get('#listaPalabras', { timeout: 10000 }).should(($lista) => {
      const tieneLoading = $lista.find('.loading').length > 0;
      expect(tieneLoading).to.be.false;
    });

    // 4) Contar cuántas palabras hay ANTES (ahora debería ser 0 y controlado por el test)
    cy.get('#listaPalabras').then(($listaAntes) => {
      const cantidadAntes = $listaAntes.find('.palabra-item').length;

      // Dejar el input vacío y hacer clic en Agregar
      cy.get('#palabraInput').clear();
      cy.contains('button', 'Agregar').click();

      // 5) Volver a contar DESPUÉS y comparar
      cy.get('#listaPalabras').then(($listaDespues) => {
        const cantidadDespues = $listaDespues.find('.palabra-item').length;
        expect(cantidadDespues).to.eq(cantidadAntes);
      });
    });
  });
});
