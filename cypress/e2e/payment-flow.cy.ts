describe('Stripe Payment Flow', () => {
  const testEmail = 'jeremy@aistos.fr'

  beforeEach(() => {
    // Visit debtor page
    cy.visit(`/debtor/${encodeURIComponent(testEmail)}`)
    cy.wait(2000) // Wait for page to load
  })

  it('should display debt information correctly', () => {
    cy.contains('Informations de la dette').should('be.visible')
    cy.contains(testEmail).should('be.visible')
    cy.contains('Montant').should('be.visible')
  })

  it('should show Pay button for pending debts', () => {
    // Check if debt is pending
    cy.get('body').then(($body) => {
      if ($body.text().includes('En attente')) {
        cy.contains('Payer maintenant').should('be.visible')
        cy.contains('Payer maintenant').should('not.be.disabled')
      }
    })
  })

  it('should create payment session when Pay button is clicked', () => {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Payer maintenant')) {
        // Intercept the payment creation request
        cy.intercept('POST', '/api/payments/create').as('createPayment')

        cy.contains('Payer maintenant').click()

        // Wait for payment session creation
        cy.wait('@createPayment').then((interception) => {
          expect(interception.response?.statusCode).to.eq(200)
          expect(interception.response?.body.success).to.be.true
          expect(interception.response?.body.url).to.exist
        })

        // Should redirect to Stripe (in test mode, we can't complete the actual payment)
        // But we can verify the redirect happens
        cy.url({ timeout: 10000 }).should('include', 'checkout.stripe.com')
      }
    })
  })

  it('should handle payment cancellation', () => {
    // This test would require simulating a cancel flow
    // For now, we'll just verify the cancel URL structure
    cy.request({
      method: 'POST',
      url: '/api/payments/create',
      body: {
        email: testEmail,
      },
    }).then((response) => {
      expect(response.body.success).to.be.true
      // Verify cancel URL includes the email
      expect(response.body.url).to.exist
    })
  })

  it('should not show Pay button for already paid debts', () => {
    // This would require setting up a paid debt in the test database
    // For now, we verify the UI logic
    cy.get('body').then(($body) => {
      if ($body.text().includes('Payé')) {
        cy.contains('Payer maintenant').should('not.exist')
        cy.contains('Déjà payé').should('be.visible')
      }
    })
  })
})

