# Cypress E2E Tests

This directory contains end-to-end tests for the Aistos Debt Payment application.

## Test Files

- `csv-import.cy.ts` - Tests CSV import functionality
- `debtor-lookup.cy.ts` - Tests debtor lookup for all emails in CSV
- `payment-flow.cy.ts` - Tests Stripe payment flow
- `status-updates.cy.ts` - Tests status updates after payment
- `edge-cases.cy.ts` - Tests edge cases and error handling

## Running Tests

### Prerequisites

1. Start the development server:
   ```bash
   bun run dev
   ```

2. Ensure Docker database is running:
   ```bash
   bun run db:up
   ```

3. Run database migrations:
   ```bash
   bun run prisma:migrate
   ```

### Run Tests

**Open Cypress Test Runner (Interactive):**
```bash
bun run test:e2e:open
```

**Run Tests Headless:**
```bash
bun run test:e2e
```

**Run Tests in Headed Mode:**
```bash
bun run test:e2e:headed
```

## Test Coverage

### CSV Import Tests
- ✅ Successful CSV import
- ✅ Invalid file handling
- ✅ Data validation

### Debtor Lookup Tests
- ✅ Lookup page display
- ✅ All emails from CSV file
- ✅ Invalid email handling
- ✅ Non-existent email handling

### Payment Flow Tests
- ✅ Debt information display
- ✅ Pay button visibility
- ✅ Payment session creation
- ✅ Payment cancellation
- ✅ Already paid debt handling

### Status Update Tests
- ✅ Webhook status updates
- ✅ Polling mechanism
- ✅ Real-time status changes

### Edge Cases
- ✅ Invalid email format
- ✅ Empty email
- ✅ Non-existent email
- ✅ Already paid debt prevention
- ✅ Malformed CSV data
- ✅ API error handling
- ✅ Payment session creation failure
- ✅ Required field validation

## Configuration

Tests are configured in `cypress.config.ts`:
- Base URL: `http://localhost:3000`
- Viewport: 1280x720
- Videos: Disabled (can be enabled)
- Screenshots: Enabled on failure

## Notes

- Tests require the application to be running on `localhost:3000`
- Database should be seeded with test data before running tests
- Stripe test mode is used for payment tests
- Some tests may require manual webhook simulation for full coverage

