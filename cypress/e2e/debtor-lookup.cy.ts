describe('Debtor Lookup', () => {
  const testEmails = [
    'jeremy@aistos.fr',
    'victor@aistos.fr',
    'frodon@comte.fr',
    'vador@empire.fr',
    'steve@minecraft.fr',
    'heisenberg@lospollos.fr',
    'gandalf@magiciens.fr',
    'leia@rebellion.fr',
    'creeper@minecraft.fr',
  ]

  beforeEach(() => {
    cy.visit('/debtor')
  })

  it('should display debtor lookup page', () => {
    cy.contains('Rechercher une dette').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('button').contains('Rechercher').should('be.visible')
  })

  testEmails.forEach((email) => {
    it(`should find and display debt information for ${email}`, () => {
      // Enter email and submit
      cy.get('input[type="email"]').type(email)
      cy.get('button').contains('Rechercher').click()

      // Wait for navigation and debt details to load
      cy.url().should('include', `/debtor/${encodeURIComponent(email)}`)
      cy.contains('Informations de la dette', { timeout: 5000 }).should('be.visible')
      
      // Verify debt information is displayed
      cy.contains(email).should('be.visible')
      cy.contains('Montant').should('be.visible')
      cy.contains('Statut').should('be.visible')
    })
  })

  it('should handle invalid email', () => {
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('button').contains('Rechercher').click()

    // Should show error or stay on page
    cy.url().should('include', '/debtor')
  })

  it('should handle non-existent email', () => {
    cy.get('input[type="email"]').type('nonexistent@example.com')
    cy.get('button').contains('Rechercher').click()

    // Wait for error message
    cy.contains('introuvable', { timeout: 5000 }).should('be.visible')
  })
})

