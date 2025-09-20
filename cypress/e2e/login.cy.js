function waitForDatabaseReady(retries = 10, delay = 2000) {
  // Ajuste a URL para o endpoint de health check da sua API/banco
  const healthUrl = 'http://localhost:3000/health';
  function check(retryCount) {
    cy.request({
      url: healthUrl,
      failOnStatusCode: false
    }).then((resp) => {
      if (resp.status === 200) {
        // Banco está pronto
        return;
      }
      if (retryCount > 0) {
        cy.wait(delay).then(() => check(retryCount - 1));
      } else {
        throw new Error('Banco de dados não está pronto');
      }
    });
  }
  check(retries);
}

describe('Login Test', () => {
  beforeEach(() => {
    waitForDatabaseReady();
  });
  
  it('Login com sucesso dados validos', () => {
    cy.visit('/login')
    cy.get('[name="email"]').type('admin@teste.com')
    cy.get('[name="password"]').type('123456')
    cy.get('.btn-primary').click()
    cy.get('span').should('contain.text', 'Logado como:')

  })

  it('Falha - login com email invalido e senha valida', () => {
    cy.visit('/login')
    cy.get('[name="email"]').type('admi@teste.com')
    cy.get('[name="password"]').type('123456')
    cy.get('.btn-primary').click()
    cy.get('.auth-card').should('contain.text', 'Usuário de teste')
    

  })
  it('Falha - login com email valido e senha invalida', () => {
    cy.visit('/login')
    cy.get('[name="email"]').type('admin@teste.com')
    cy.get('[name="password"]').type('1234567')
    cy.get('.btn-primary').click()
    cy.get('.auth-card').should('contain.text', 'Usuário de teste')
    

  })
  it('Falha - login com email e senha vazios', () => {
    cy.visit('/login')
    cy.get('[name="email"]').clear()
    cy.get('[name="password"]').clear()
    cy.get('.btn-primary').click()
    cy.get('.auth-card').should('contain.text', 'Usuário de teste')
    

  })
  it('Falha - login com email vazio e senha valida', () => {
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