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

describe('Botões do Dashboard', () => {
  beforeEach(() => {
    waitForDatabaseReady();
    loginPage.accessLoginPage();
    loginPage.loginemail('admin@teste.com')
    loginPage.loginpassword('123456')
    loginPage.loginButtontest()
    loginPage.validarMensagemErro('Logado como:')

  });

  
  it('Botão Novo Contato', () => {
    dashboardPage.newcontact()
    dashboardPage.assertNewContactPage()

  })
  it('Botão Sair', () => {
    dashboardPage.buttonExit()
    loginPage.validarLoginInvalido('Usuário de teste')
    
  })
  it('Botão Link Novo Contato', () => {
    loginPage.accessLoginPage();
    cy.get('body').then($body => {
    const hasLink = $body.find('a:contains("Criar primeiro contato")').length > 0;
    if (hasLink) {
    cy.contains('Criar primeiro contato').click();
  }
});
    dashboardPage.assertNewContactPage()
    gestaoNovoContato.nomeEntrada('Contato de Teste');
    gestaoNovoContato.sobrenomeEntrada('Teste');
    gestaoNovoContato.dateSelector('1990-01-01');
    gestaoNovoContato.sexoSelector('Masculino');
    gestaoNovoContato.emailEntrada('123@gmail.com');
    gestaoNovoContato.urlEntrada('https://www.linkedin.com/in/teste/');
    gestaoNovoContato.obsEntrada('Contato criado para fins de teste automatizado.');
// salvar contato
    gestaoNovoContato.salvarContato();
// depois de criar, o link não deve existir
    cy.get('body').find('a:contains("Criar primeiro contato")').should('not.exist');
// ... passos para excluir todos os contatos ...
    cy.get('.btn-delete').click();
// com a lista vazia, o link volta e pode ser validado/clicado
    cy.contains('Criar primeiro contato').should('be.visible');
  })
  it('Botão Like', () => {
    dashboardPage.newcontact()
    dashboardPage.assertNewContactPage()
    gestaoNovoContato.nomeEntrada('Teste QA Automatizado');
    gestaoNovoContato.sobrenomeEntrada('Teste');
    gestaoNovoContato.dateSelector('1990-01-01');
    gestaoNovoContato.sexoSelector('Masculino');
    gestaoNovoContato.emailEntrada('testeQA@gmail.com');
    gestaoNovoContato.urlEntrada('https://www.linkedin.com/in/teste/');
    gestaoNovoContato.obsEntrada('Contato criado para fins de teste automatizado.');
    gestaoNovoContato.salvarContato();
    cy.contains('.contact-card', 'Teste QA Automatizado').within(() => {
    const likeButtonSelector = 'button:contains("👍")'
    cy.get(likeButtonSelector)
      .invoke('text')
      .then((txt) => {
        const match = txt.match(/\d+/)
        expect(match, 'deve encontrar um número no botão').to.not.be.null
        const before = parseInt(match[0], 10)

        cy.get(likeButtonSelector).click()

        cy.get(likeButtonSelector).should(($btn) => {
          const newText = $btn.text()
          const m = newText.match(/\d+/)
          expect(m, 'deve encontrar número após o clique').to.not.be.null
          const after = parseInt(m[0], 10)
          expect(after).to.eq(before + 1)
        })
      })
  
})
  })
  it('Botão Deslike', () => {
    // Seletor ajustável — troque para o botão de "👎" ou a classe que você tem
  const dislikeButtonSelector = 'button:contains("👎")'
  const likeButtonSelector = 'button:contains("👍")'

  // Lê o valor atual de likes
  cy.get(likeButtonSelector)
    .invoke('text')
    .then((txt) => {
      const match = txt.match(/\d+/)
      expect(match, 'deve encontrar um número no botão de like').to.not.be.null
      const before = parseInt(match[0], 10)

      // Clica no botão de dislike
      cy.get(dislikeButtonSelector).click()

      // Verifica se diminuiu 1
      cy.get(likeButtonSelector).should(($btn) => {
        const newText = $btn.text()
        const m = newText.match(/\d+/)
        expect(m, 'deve encontrar número no botão de like após dislike').to.not.be.null
        const after = parseInt(m[0], 10)
        expect(after).to.eq(before - 1)
      })
    })
  })
  it('Botão Editar', () => {
    dashboardPage.botaoEditar()
    dashboardPage.checktelaEditar()  

  })
  it('Botão Excluir', () => {
    dashboardPage.botaoExcluir()
  });













})