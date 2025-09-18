describe('Login Test', () => {
  
  it.skip('Login com sucesso dados validos', () => {
    cy.visit('/login')
    cy.get('[name="email"]').type('admin@teste.com')
    cy.get('[name="password"]').type('123456')
    cy.get('.btn-primary').click()
    cy.get('span').should('contain.text', 'Logado como:')

  })

  it.skip('Falha - login com email invalido e senha valida', () => {
    cy.visit('/login')
    cy.get('[name="email"]').type('admi@teste.com')
    cy.get('[name="password"]').type('123456')
    cy.get('.btn-primary').click()
    cy.get('.auth-card').should('contain.text', 'Usuário de teste')
    

  })
  it.skip('Falha - login com email valido e senha invalida', () => {
    cy.visit('/login')
    cy.get('[name="email"]').type('admin@teste.com')
    cy.get('[name="password"]').type('1234567')
    cy.get('.btn-primary').click()
    cy.get('.auth-card').should('contain.text', 'Usuário de teste')
    

  })
  it.skip('Falha - login com email e senha vazios', () => {
    cy.visit('/login')
    cy.get('[name="email"]').clear()
    cy.get('[name="password"]').clear()
    cy.get('.btn-primary').click()
    cy.get('.auth-card').should('contain.text', 'Usuário de teste')
    

  })
  it.skip('Falha - login com email vazio e senha valida', () => {
    cy.visit('/login')
    cy.get('[name="email"]').clear()
    cy.get('[name="password"]').type('1234567')
    cy.get('.btn-primary').click()
    cy.get('.auth-card').should('contain.text', 'Usuário de teste')
    

  })
  it('Falha - login com email valido e senha vazia', () => {
    cy.visit('/login')
    cy.get('[name="email"]').type('admin@teste.com')
    cy.get('[name="password"]').clear()
    cy.get('.btn-primary').click()
    cy.get('.auth-card').should('contain.text', 'Usuário de teste')
    

  })




})