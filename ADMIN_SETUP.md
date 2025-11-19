# Admin Setup Guide

## Database Migration

First, run the database migration to create the new tables:

```bash
bunx prisma migrate dev --name add_payment_history_and_admin
bunx prisma generate
```

## Create Admin User

To create the first admin user, run:

```bash
bun run create-admin <username> <password> <email>
```

Example:
```bash
bun run create-admin admin mypassword123 admin@example.com
```

## Email Configuration

Add the following environment variables to your `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@aistos.com
```

### Gmail Setup

If using Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASSWORD`

## Access Admin Panel

1. Navigate to `/admin/login`
2. Enter your admin credentials
3. You'll be redirected to `/admin` where you can:
   - View all debts
   - Search and filter debts
   - Export to CSV
   - View payment history

## Features

### Admin Dashboard
- List view of all debts with pagination
- Search by name, email, or debt subject
- Filter by status (PENDING/PAID)
- Export debts to CSV
- View payment history for each debt

### Email Notifications
- Automatic email sent when a new debt is created (CSV import)
- Payment confirmation email sent after successful payment

### Payment History
- All payments are tracked in the `payment_history` table
- Payment history is displayed in the admin panel
- Each payment includes amount, Stripe payment ID, status, and timestamp

