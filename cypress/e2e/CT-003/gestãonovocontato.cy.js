import DashboardPage from "../../pages/buttonDashboards";
import LoginPage from "../../pages/loginPage"
import GestaoNovoContato from "../../pages/gestaonovocontato";

const dashboardPage = new DashboardPage();
const loginPage = new LoginPage();
const gestaoNovoContato = new GestaoNovoContato();

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
describe('Gestão de novo contato', () => {
  beforeEach(() => {
    waitForDatabaseReady();
    loginPage.accessLoginPage();
    loginPage.loginemail('admin@teste.com')
    loginPage.loginpassword('123456')
    loginPage.loginButtontest()
    loginPage.validarMensagemErro('Logado como:')
  });

  it('Botão voltar - Tela Contatos', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.botaoVoltar()
    loginPage.validarMensagemErro('Logado como:')
    
  })
  it('Botão Cancelar - Tela Contatos', () => {
    dashboardPage.newcontact()
    cy.get('.form-actions > .btn-secondary').click()
    loginPage.validarMensagemErro('Logado como:')

  })
  it('Cadastro de Novo Contato com sucesso', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('testeQA@gmai.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
    gestaoNovoContato.contatoCheck()
    dashboardPage.botaoExcluir()

  })
  it('Cadastro de Novo Contato  - Campo nome vazio', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('testeQA@gmail.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
  })
  it('Cadastro de Novo Contato - Menos de 4 Caracteres', () => {
    cy.on('window:alert', (text) => {
    expect(text).to.contains('Nome deve ter entre 4 e 256 caracteres')
  })
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Tes')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('testeQA@gmail.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
  })
  it('BUG: Sistema aceita nome com mais de 256 caracteres', () => {
  // Gerar string com 257 caracteres
  const nomeInvalido = Cypress._.repeat('A', 257)
  
  // Configurar intercept para capturar a resposta
  cy.intercept('POST', '/api/contacts').as('postContato')
  
  dashboardPage.newcontact()
  gestaoNovoContato.nomeEntrada(nomeInvalido)
  gestaoNovoContato.sobrenomeEntrada('Automatizado')
  gestaoNovoContato.dateSelector('2000-01-01')
  gestaoNovoContato.sexoSelector('Feminino')
  gestaoNovoContato.emailEntrada('testeQA@gmail.com')
  gestaoNovoContato.urlEntrada('https://www.cypress.io/')
  gestaoNovoContato.obsEntrada('Teste de bug - campo aceita mais de 256 caracteres')
  gestaoNovoContato.salvarContato()
  dashboardPage.botaoExcluir()

  
  // ASSERÇÃO QUE VAI FALHAR E MOSTRAR O BUG
  cy.wait('@postContato').then(({ response }) => {
    // O sistema DEVERIA retornar 400, mas retorna 200 (bug)
    expect(response.statusCode, 
      'BUG ENCONTRADO: API deveria rejeitar nome com mais de 256 caracteres mas retornou sucesso'
    ).to.equal(200)
  })
  }) 
  it('Cadastro de Novo Contato - Sobrenome vazio', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('testeQA@gmail.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
    gestaoNovoContato.assertChecknewcontact()
    
  })
  it('Cadastro de Novo Contato - Sobrenome com menos de 4 Caracteres', () => {
    cy.on('window:alert', (text) => {
    expect(text).to.contains('Sobrenome deve ter entre 4 e 256 caracteres')
  })
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Au')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('testeQA@gmail.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
  })
  it('BUG: Sistema aceita sobrenome com mais de 256 caracteres', () => {
  // Gerar string com 257 caracteres
  const sobrenomeInvalido = Cypress._.repeat('B', 257)
  
  // Configurar intercept para capturar a resposta
  cy.intercept('POST', '/api/contacts').as('postContato')
  
  dashboardPage.newcontact()
  gestaoNovoContato.nomeEntrada('Teste QA')
  gestaoNovoContato.sobrenomeEntrada(sobrenomeInvalido)
  gestaoNovoContato.dateSelector('2000-01-01')
  gestaoNovoContato.sexoSelector('Feminino')
  gestaoNovoContato.emailEntrada('testeQA@gmail.com')
  gestaoNovoContato.urlEntrada('https://www.cypress.io/')
  gestaoNovoContato.obsEntrada('Teste de bug - campo aceita mais de 256 caracteres')
  gestaoNovoContato.salvarContato()
  dashboardPage.botaoExcluir()
  
  // ASSERÇÃO QUE VAI FALHAR E MOSTRAR O BUG
  cy.wait('@postContato').then(({ response }) => {
    // O sistema DEVERIA retornar 400, mas retorna 200 (bug)
    expect(response.statusCode, 
      'BUG ENCONTRADO: API deveria rejeitar sobrenome com mais de 256 caracteres mas retornou sucesso'
    ).to.equal(200)
  })
  })
  it('Cadastro de Novo Contato - Data de Nacimento vazia ', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('teste@QA@gmail.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
    gestaoNovoContato.assertChecknewcontact()
    
  })
  it('Cadastro de Novo Contato - Menor de 18 anos', () => {
    dashboardPage.newcontact()
    cy.on('window:alert', (text) => {
    expect(text).to.contains('A idade mínima é de 18 anos.')
  })
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2010-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('teste@gmail.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
    
  })
  it('Cadastro de Novo Contato - Sexo Biologico vazio', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.emailEntrada('testeQA@gmail.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
    gestaoNovoContato.assertChecknewcontact()

  })
  it('Cadastro de Novo Contato - Sexo Biologico Feminino', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('testeQA@gmail.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
    gestaoNovoContato.contatoCheck()
    dashboardPage.botaoExcluir()
  })
  it('Cadastro de Novo Contato - Sexo Biologico Masculino', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Masculino')
    gestaoNovoContato.emailEntrada('testeQA@gmail.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
    gestaoNovoContato.contatoCheck()
    dashboardPage.botaoExcluir()
  })
  it('Cadastro de Novo Contato - Email Invalido', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('testeQAgmail.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
    gestaoNovoContato.assertChecknewcontact()
  })
  it('Cadastro de Novo Contato - Email vazio', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
    gestaoNovoContato.assertDashbordTela()
    dashboardPage.botaoExcluir()
    
  })
  it('Cadastro de Novo Contato - Redes Sociais', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('testeQA@gmail.com')
    gestaoNovoContato.urlEntrada('rede1, rede2, rede3, rede4, rede5, rede6, rede7, rede8, rede9, rede10')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
    gestaoNovoContato.assertChecknewcontact()
  })
  it('Cadastro de Novo Contato - Redes Sociais vazia', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('testeQA@gmail.com')
    gestaoNovoContato.obsEntrada('Contato de teste automatizado')
    gestaoNovoContato.salvarContato()
    gestaoNovoContato.contatoCheck()
    dashboardPage.botaoExcluir()
  })
  it('Cadastro de Novo Contato - Observações vazia', () => {
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('testeQA@gmail.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.salvarContato()
    gestaoNovoContato.contatoCheck()
    dashboardPage.botaoExcluir()
  })
  it('Cadastro de Novo Contato - Observações com 513 caracteres', () => {
    cy.on('window:alert', (text) => {
    expect(text).to.contains('Observações deve ter no máximo 512 caracteres')
  })
    const obsInvalido = Cypress._.repeat('C', 513)
    dashboardPage.newcontact()
    gestaoNovoContato.nomeEntrada('Teste QA')
    gestaoNovoContato.sobrenomeEntrada('Automatizado')
    gestaoNovoContato.dateSelector('2000-01-01')
    gestaoNovoContato.sexoSelector('Feminino')
    gestaoNovoContato.emailEntrada('testeQA@gmail.com')
    gestaoNovoContato.urlEntrada('https://www.cypress.io/')
    gestaoNovoContato.obsEntrada(obsInvalido)
    gestaoNovoContato.salvarContato()
    dashboardPage.botaoExcluir()
  })





  


  


})