import LoginPage from "../../pages/loginPage"

const loginPage = new LoginPage();

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
  })
  it('Login com sucesso dados validos', () => {
    loginPage.accessLoginPage();
    loginPage.loginemail('admin@teste.com')
    loginPage.loginpassword('123456')
    loginPage.loginButtontest()
    loginPage.validarMensagemErro('Logado como:')
  })
  it('Falha - login com email não cadastrado e senha valida', () => {
    loginPage.accessLoginPage()
    loginPage.loginemail('usuario@teste.com')
    loginPage.loginpassword('123456')
    loginPage.loginButtontest()
    loginPage.validarLoginInvalido('Usuário de teste')
    

  })
  it('Falha - login com email valido e senha invalida', () => {
    loginPage.accessLoginPage()
    loginPage.loginemail('admin@teste.com')
    loginPage.loginpassword('1234567')
    loginPage.loginButtontest()
    loginPage.validarLoginInvalido('Usuário de teste')  
  })
  it('Falha - login com email e senha vazios', () => {
    loginPage.accessLoginPage()
    loginPage.loginButtontest()
    loginPage.validarLoginInvalido('Usuário de teste')
  })
  it('Falha - login com email vazio e senha valida', () => {
    loginPage.accessLoginPage();
    loginPage.loginpassword('123456')
    loginPage.loginButtontest()
    loginPage.validarLoginInvalido('Usuário de teste')
  })
  it('Falha - login com email valido e senha vazia', () => {
    loginPage.accessLoginPage()
    loginPage.loginemail('admin@teste.com')
    loginPage.loginButtontest()
    loginPage.validarLoginInvalido('Usuário de teste')
    
    

  })




})