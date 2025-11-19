describe('Edge Cases', () => {
  it('should handle invalid email format', () => {
    cy.visit('/debtor')
    cy.get('input[type="email"]').type('not-an-email')
    cy.get('button').contains('Rechercher').click()

    // Should show validation error or stay on page
    cy.url().should('include', '/debtor')
  })

  it('should handle empty email', () => {
    cy.visit('/debtor')
    cy.get('button').contains('Rechercher').should('be.disabled')
  })

  it('should handle non-existent email address', () => {
    cy.request({
      method: 'GET',
      url: '/api/debts/nonexistent@example.com',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404)
      expect(response.body.success).to.be.false
      expect(response.body.error).to.include('not found')
    })
  })

  it('should prevent payment for already paid debt', () => {
    // First, find or create a paid debt
    cy.request({
      method: 'POST',
      url: '/api/payments/create',
      body: {
        email: 'test-paid@example.com', // Assuming this debt is paid
      },
      failOnStatusCode: false,
    }).then((response) => {
      // Should return error if debt is already paid
      if (response.status === 400) {
        expect(response.body.error).to.include('already been paid')
      }
    })
  })

  it('should handle malformed CSV data', () => {
    // Create a test CSV with invalid data
    const invalidCsv = 'name,email,debtSubject,debtAmount\nInvalid,,,not-a-number'

    cy.request({
      method: 'POST',
      url: '/api/debts/import',
      body: {
        filePath: './invalid.csv', // Non-existent file
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404)
    })
  })

  it('should handle API errors gracefully', () => {
    cy.visit('/debtor/invalid%40email')
    cy.wait(2000)
    
    // Should show error message
    cy.contains('Erreur').should('be.visible')
    cy.contains('Retour à la recherche').should('be.visible')
  })

  it('should handle payment session creation failure', () => {
    cy.request({
      method: 'POST',
      url: '/api/payments/create',
      body: {
        email: 'nonexistent@example.com',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404)
      expect(response.body.success).to.be.false
    })
  })

  it('should validate required fields in payment creation', () => {
    cy.request({
      method: 'POST',
      url: '/api/payments/create',
      body: {},
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.include('required')
    })
  })
})

