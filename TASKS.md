# Project Tasks - Debt Payment Application

## Phase 1: Project Setup & Configuration ✅ COMPLETE

### Task 1.1: Initialize Next.js Project with TypeScript
- [x] Create Next.js project with TypeScript template (`npx create-next-app@latest`)
- [x] Configure TypeScript config (`tsconfig.json`)
- [x] Set up project folder structure (app directory or pages directory)
- [x] Configure Bun as runtime (update package.json scripts)

### Task 1.2: Set Up Bun Runtime
- [x] Install Bun (if not already installed)
- [x] Update `package.json` scripts to use Bun
- [x] Configure Bun for development and production
- [x] Set up environment variables file (`.env.example`)

### Task 1.3: Install Required Dependencies
- [x] Install Stripe SDK (`stripe`)
- [x] Install CSV parser (`csv-parse` or `papaparse`)
- [x] Install Prisma (`@prisma/client`, `prisma`)
- [x] Install validation library (Zod recommended)
- [x] Install WebSocket library (if implementing real-time features)

### Task 1.4: Set Up UI Framework
- [x] Install and configure TailwindCSS
- [x] Initialize Shadcn/ui (`npx shadcn-ui@latest init`)
- [x] Configure Shadcn/ui components directory
- [x] Set up theme configuration

## Phase 2: Database Setup with Prisma

### Task 2.1: Prisma Configuration
- [x] Initialize Prisma (`bunx prisma init`)
- [x] Configure PostgreSQL database URL in `.env`
- [x] Set up Prisma schema file (`prisma/schema.prisma`)
- [x] Configure Prisma client generation

### Task 2.2: Create Database Schema
- [x] Define Debt model in Prisma schema with fields:
  - `id` (Int, @id, @default(autoincrement()))
  - `name` (String)
  - `email` (String, @unique or indexed)
  - `debtSubject` (String)
  - `debtAmount` (Decimal or Float)
  - `status` (Enum: PENDING, PAID)
  - `stripePaymentId` (String?, optional)
  - `createdAt` (DateTime, @default(now()))
  - `updatedAt` (DateTime, @updatedAt)
- [x] Generate Prisma Client (`bunx prisma generate`)
- [x] Create and run migration (`bunx prisma migrate dev`)
- [x] Verify database connection

## Phase 3: CSV Import Functionality

### Task 3.1: CSV Parser Implementation
- [x] Create CSV parsing utility function
- [x] Validate CSV structure (check required columns)
- [x] Handle data type conversions (debtAmount to number)
- [x] Add error handling for malformed CSV

### Task 3.2: Import API Route (Next.js)
- [ ] Create Next.js API route (`/api/import` or `/api/debts/import`)
- [ ] Read `file.csv` from project directory
- [ ] Parse CSV data using chosen parser
- [ ] Use Prisma Client to insert records into database
- [ ] Handle duplicate entries (skip or update using upsert)
- [ ] Return import results (success count, errors) as JSON response

### Task 3.3: Data Validation
- [ ] Validate email format
- [ ] Validate debtAmount is positive number
- [ ] Validate required fields are present
- [ ] Add error messages for invalid data

## Phase 4: Debtor Page (Frontend)

### Task 4.1: Create Debtor Lookup Page (Next.js)
- [ ] Create Next.js page route (e.g., `/debtor` or `/debtor/[email]`)
- [ ] Create page component using React
- [ ] Add email input form using Shadcn/ui components (Input, Button)
- [ ] Style with TailwindCSS

### Task 4.2: Display Debt Information
- [ ] Create Next.js API route to fetch debt by email (`/api/debts/[email]`)
- [ ] Use Prisma Client to query database
- [ ] Create React component to display debtor information:
  - Name (using Shadcn/ui Card or similar)
  - Email
  - Debt Subject
  - Debt Amount (formatted currency with Intl.NumberFormat)
  - Status (with Badge component from Shadcn/ui)
- [ ] Style the page with TailwindCSS and Shadcn/ui components

### Task 4.3: Pay Button Implementation
- [ ] Add "Pay" button using Shadcn/ui Button component
- [ ] Show button only if status is 'PENDING'
- [ ] Disable button if debt is already paid
- [ ] Add loading state with Shadcn/ui Spinner or Button loading prop

## Phase 5: Stripe Integration

### Task 5.1: Stripe Configuration
- [ ] Get Stripe test API keys
- [ ] Add Stripe secret key to `.env` (server-side)
- [ ] Add Stripe publishable key to `.env.local` or Next.js env vars
- [ ] Initialize Stripe client in API routes (using Bun runtime)
- [ ] Install `@stripe/stripe-js` for frontend

### Task 5.2: Payment Session Creation (Next.js API Route)
- [ ] Create Next.js API route to initiate Stripe payment (`/api/payments/create`)
- [ ] Use Bun runtime with Stripe SDK
- [ ] Create Stripe Checkout Session or Payment Intent
- [ ] Set amount from debtAmount (convert to cents)
- [ ] Add metadata (debt ID, email)
- [ ] Configure success/cancel URLs (Next.js routes)
- [ ] Return session ID or client secret to frontend

### Task 5.3: Payment Processing (React Components)
- [ ] Create payment page component using React
- [ ] Use Stripe Elements or redirect to Stripe Checkout
- [ ] Handle payment success callback (redirect to success page)
- [ ] Handle payment failure/cancellation (redirect to cancel page)
- [ ] Style payment UI with TailwindCSS and Shadcn/ui

### Task 5.4: Webhook Handler (Next.js API Route)
- [ ] Create Next.js API route for Stripe webhooks (`/api/webhooks/stripe`)
- [ ] Verify webhook signature using Stripe SDK
- [ ] Handle `payment_intent.succeeded` or `checkout.session.completed` event
- [ ] Use Prisma Client to update debt status to 'PAID' in database
- [ ] Store Stripe payment ID in database
- [ ] Return appropriate HTTP status codes

### Task 5.5: Status Update After Payment
- [ ] Update debt status after successful payment (via webhook)
- [ ] Create success page component (Next.js route)
- [ ] Refresh debtor page to show updated status (React state or refetch)
- [ ] Add success message/notification using Shadcn/ui Toast or Alert component
- [ ] (Optional) Implement WebSocket for real-time status updates

## Phase 6: Testing & Validation

### Task 6.1: Manual Testing
- [ ] Test CSV import with provided `file.csv`
- [ ] Test debtor page lookup for each email in CSV
- [ ] Test Stripe payment flow (test mode)
- [ ] Verify status updates after payment
- [ ] Test edge cases (invalid email, already paid debt, etc.)

### Task 6.2: Error Handling
- [ ] Add error handling for Prisma database connection failures
- [ ] Handle Stripe API errors gracefully
- [ ] Add user-friendly error messages using Shadcn/ui Alert components
- [ ] Implement error boundaries in React components
- [ ] Log errors appropriately (console or logging service)

## Phase 7: Documentation & Finalization

### Task 7.1: Create README.md
- [ ] **Démarrage** section:
  - Installation instructions
  - Environment variables setup
  - How to run the project
  - How to test (including Stripe test cards)
- [ ] **Choix d'architecture** section:
  - Framework choice and reasoning
  - Database choice and reasoning
  - Architecture decisions
  - Assumptions made
  - Known limitations
- [ ] **Avant une mise en production** section:
  - Security improvements needed
  - Performance optimizations
  - Monitoring and logging
  - Error handling improvements
  - Testing strategy
- [ ] **Ressources utilisées** section:
  - Documentation links (Stripe, framework, etc.)
  - Tools used
  - AI assistants used (if applicable)

### Task 7.2: Git Repository Setup
- [ ] Initialize Git repository
- [ ] Create `.gitignore` file
- [ ] Add `.env` to gitignore
- [ ] Commit initial project structure
- [ ] Include `file.csv` in repository
- [ ] Create meaningful commit messages

### Task 7.3: Final Checks
- [ ] Verify all requirements are met
- [ ] Test complete flow end-to-end
- [ ] Ensure code is clean and well-commented
- [ ] Verify README is complete and accurate
- [ ] Check that CSV file is included in repo

## Optional Enhancements (If Time Permits)

### Task 8.1: Additional Features
- [ ] Add list view of all debts (admin view)
- [ ] Add search/filter functionality
- [ ] Add payment history
- [ ] Add email notifications
- [ ] Add authentication/authorization

### Task 8.2: UI/UX Improvements
- [ ] Responsive design for mobile (TailwindCSS responsive classes)
- [ ] Loading states and animations (Shadcn/ui Skeleton components)
- [ ] Better error messages (Shadcn/ui Alert/Toast)
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Dark mode support (TailwindCSS + Shadcn/ui theme)

---

## Quick Start Checklist

Before starting, ensure you have:
- [ ] Bun installed (latest version)
- [ ] PostgreSQL installed and running
- [ ] Stripe test account created
- [ ] Git initialized
- [ ] Code editor ready (Cursor/VS Code)
- [ ] Node.js (v18+) for Next.js compatibility (if needed)

## Tech Stack Summary

**Backend:**
- Runtime: Bun
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- APIs: REST (Next.js API Routes), WebSockets (optional for real-time)

**Frontend:**
- Framework: Next.js / React
- Styling: TailwindCSS
- UI Components: Shadcn/ui
- Payment: Stripe

## Estimated Time Breakdown

- Phase 1 (Setup): 45-60 minutes (includes Bun, Next.js, Prisma, Shadcn/ui setup)
- Phase 2 (Database): 30-45 minutes
- Phase 3 (CSV Import): 45-60 minutes
- Phase 4 (Debtor Page): 60-90 minutes (includes Shadcn/ui components)
- Phase 5 (Stripe): 90-120 minutes
- Phase 6 (Testing): 30-45 minutes
- Phase 7 (Documentation): 45-60 minutes

**Total: ~6-8 hours**

