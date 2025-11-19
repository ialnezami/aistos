describe('CSV Import', () => {
  beforeEach(() => {
    // Start with a clean state - you might want to reset the database
    cy.visit('/')
  })

  it('should import CSV file successfully', () => {
    cy.request({
      method: 'POST',
      url: '/api/debts/import',
      body: {
        filePath: './file.csv',
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.success).to.be.true
      expect(response.body.summary).to.exist
      expect(response.body.summary.totalRows).to.be.greaterThan(0)
      expect(response.body.summary.validRows).to.be.greaterThan(0)
    })
  })

  it('should handle invalid CSV file', () => {
    cy.request({
      method: 'POST',
      url: '/api/debts/import',
      body: {
        filePath: './nonexistent.csv',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404)
      expect(response.body.success).to.be.false
    })
  })

  it('should validate CSV data', () => {
    cy.request({
      method: 'POST',
      url: '/api/debts/import',
      body: {
        filePath: './file.csv',
      },
    }).then((response) => {
      expect(response.body.summary.created + response.body.summary.updated).to.be.greaterThan(0)
    })
  })
})

