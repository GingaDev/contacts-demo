class DashboardsPage {
    selectorsList() {
      const selectors = {
        newContactButton: '.btn-primary',
        assetNewContact: 'h1',
        exitButton: '.btn-secondary',
        likeButton: '.btn-like',
        editButton: '.btn-edit',
        checkButtonEdit: 'h1',
        excluirButton: '.btn-delete'


        
        
      }
      return selectors;
    }
    newcontact() {
      cy.get(this.selectorsList().newContactButton).click()
    }
    assertNewContactPage() {
      cy.get(this.selectorsList().assetNewContact).should('contain', 'Novo Contato');
    }
    buttonExit() {
      cy.get(this.selectorsList().exitButton).click()
    }
    likeBotao() {
      cy.get(this.selectorsList().likeButton).click()
    }
    botaoEditar() {
      cy.get(this.selectorsList().editButton).click()
    }
    checktelaEditar() {
      cy.get(this.selectorsList().checkButtonEdit).should('contain', 'Editar Contato');
    }
    botaoExcluir() {
      cy.get(this.selectorsList().excluirButton).click()
    }
    
    

}


// Exporta uma instância para ser usada direto
export default DashboardsPage
