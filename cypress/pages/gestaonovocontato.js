
class GestaoNovoContato {
    selectorsList() {
      const selectors = {
        backButton: '.header > .btn-secondary',
        cancelButton: '.form-actions > .btn-secondary',
        nameInput: '[name="nome"]',
        surnameInput: '[name="sobrenome"]',
        dateInput: '[name="data_nascimento"]',
        sexSelect: '[name="sexo_biologico"]',
        emailinput: '[name="email"]',
        urlInput: '[name="redes_sociais[]"]',
        obsInput: '[name="observacoes"]',
        saveButton: '.btn-primary',
        contactCheck: 'h3',
        checkLink: '.empty-state > a',
        checknewcontact: 'h1',
        dashbordTela: 'h1'

        
      }
      return selectors;
    }
    botaoVoltar() {
      cy.get(this.selectorsList().backButton).click()
    }
    nomeEntrada(nome) {
      cy.get(this.selectorsList().nameInput).type(nome)
    }
    sobrenomeEntrada(sobrenome) {
      cy.get(this.selectorsList().surnameInput).type(sobrenome)
    }
    dateSelector(date) {
      cy.get(this.selectorsList().dateInput).click().type(date)
    }
    sexoSelector(sexo) {
      cy.get(this.selectorsList().sexSelect).select(sexo)
    }
    emailEntrada(email) {
      cy.get(this.selectorsList().emailinput).type(email)
    }
    urlEntrada(url) {
      cy.get(this.selectorsList().urlInput).type(url)
    }
    obsEntrada(obs) {
      cy.get(this.selectorsList().obsInput).type(obs)
    }
    salvarContato() {
      cy.get(this.selectorsList().saveButton).click()
    }
    contatoCheck() {
      cy.get(this.selectorsList().contactCheck).should('be.visible').and('have.text', 'Teste QA Automatizado')
    }
    assertCheckLink() {
      cy.get(this.selectorsList().checkLink).should('be.visible').and('have.text', 'Criar primeiro contato')
    }
    assertChecknewcontact() {
      cy.get(this.selectorsList().checknewcontact).should('be.visible').and('have.text', 'Novo Contato')
    }
    assertDashbordTela() {
      cy.get(this.selectorsList().dashbordTela).should('be.visible').and('have.text', 'Sistema de Contatos')
    }


    
}


// Exporta uma instância para ser usada direto
export default GestaoNovoContato
