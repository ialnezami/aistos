/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to wait for API response
       * @example cy.waitForApi('GET', '/api/debts/*')
       */
      waitForApi(method: string, url: string): Chainable<void>
    }
  }
}

export {}

