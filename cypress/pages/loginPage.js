class LoginPage {
    selectorsList() {
      const selectors = {
        loginEmail: '[name="email"]',
        loginPassword: '[name="password"]',
        loginButton: '.btn-primary',
        loggedInText: 'span',
        errorMessage: '.auth-card',
      }
      return selectors;
    }
    accessLoginPage() {
      cy.visit('/login');
    }
    
    loginButtontest() {
      cy.get(this.selectorsList().loginButton).click()
    }
    loginemail(email) {
      cy.get(this.selectorsList().loginEmail).type(email)
    }
    loginpassword(senha) {
      cy.get(this.selectorsList().loginPassword).type(senha)
    }

   

    validarMensagemErro(mensagem) {
      cy.get(this.selectorsList().loggedInText).should('contain', mensagem);
      
  }
    validarLoginInvalido(mensagem) {
      cy.get(this.selectorsList().errorMessage).should('contain', mensagem);
}
}


// Exporta uma instância para ser usada direto
export default LoginPage
