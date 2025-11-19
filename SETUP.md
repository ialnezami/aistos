# Setup Instructions

## Prerequisites

1. **Docker Desktop** must be installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker Desktop is running before proceeding

2. **Bun** installed (already done)

## Database Setup

1. **Start the PostgreSQL database:**
   ```bash
   bun run db:up
   # or
   docker-compose up -d
   ```

2. **Wait for database to be ready** (about 5-10 seconds)

3. **Generate Prisma Client:**
   ```bash
   bun run prisma:generate
   ```

4. **Run database migrations:**
   ```bash
   bun run prisma:migrate
   ```

5. **Verify database connection:**
   ```bash
   bun run prisma:studio
   ```
   This will open Prisma Studio in your browser where you can view the database.

## Environment Variables

Make sure your `.env` file is configured with:
- `DATABASE_URL` - PostgreSQL connection string (already set for Docker)
- `STRIPE_SECRET_KEY` - Your Stripe test secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe test publishable key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret (for production)

## Useful Commands

- `bun run db:up` - Start database
- `bun run db:down` - Stop database
- `bun run db:logs` - View database logs
- `bun run db:reset` - Reset database (removes all data)
- `bun run prisma:generate` - Generate Prisma Client
- `bun run prisma:migrate` - Run migrations
- `bun run prisma:studio` - Open Prisma Studio

## Troubleshooting

**Docker not running:**
- Make sure Docker Desktop is installed and running
- Check with: `docker ps`

**Database connection errors:**
- Make sure Docker container is running: `docker-compose ps`
- Check database logs: `bun run db:logs`
- Verify DATABASE_URL in `.env` file

