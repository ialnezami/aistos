# Stripe Webhook Tunnel Setup Guide

This guide explains how to set up Stripe webhook forwarding using Docker for local development.

## Quick Start

1. **Make sure your `.env` file has your Stripe secret key**:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   ```

2. **Start the webhook tunnel**:
   ```bash
   bun run stripe:webhook:setup
   ```

3. **Get the webhook secret from the logs**:
   ```bash
   bun run stripe:webhook:logs
   ```
   
   Look for: `> Ready! Your webhook signing secret is whsec_...`

4. **Add the secret to your `.env` file**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. **Restart your Next.js app** to load the new webhook secret.

## How It Works

The Docker Compose setup includes a `stripe-cli` service that:
- Listens to all Stripe events from your Stripe account
- Forwards them to `http://localhost:3000/api/webhooks/stripe`
- Provides a webhook signing secret for verification

## Troubleshooting

### Container won't start

**Issue**: `docker-compose up -d stripe-cli` fails

**Solution**: 
- Make sure Docker is running
- Check that `STRIPE_SECRET_KEY` is set in your `.env` file
- Verify the Next.js app is running on port 3000

### Webhooks not reaching the app

**Issue**: Payments complete but status doesn't update

**Solutions**:
1. Check if the tunnel is running:
   ```bash
   docker ps | grep stripe-cli
   ```

2. Check the logs for errors:
   ```bash
   bun run stripe:webhook:logs
   ```

3. Verify the webhook secret is correct in `.env`

4. Make sure your Next.js app is running on `http://localhost:3000`

5. On Linux, you might need to use `network_mode: host` in docker-compose.yml:
   ```yaml
   stripe-cli:
     network_mode: host
   ```

### Can't connect to host.docker.internal

**Issue**: Container can't reach `host.docker.internal:3000`

**Solutions**:
- **macOS/Windows**: Should work out of the box
- **Linux**: Add to docker-compose.yml:
  ```yaml
  extra_hosts:
    - "host.docker.internal:172.17.0.1"
  ```
  Or use `network_mode: host` (see above)

## Manual Commands

```bash
# Start the tunnel
bun run stripe:webhook:start
# or
docker-compose up -d stripe-cli

# Stop the tunnel
bun run stripe:webhook:stop
# or
docker-compose stop stripe-cli

# View logs
bun run stripe:webhook:logs
# or
docker logs -f aistos-stripe-cli

# Remove the container
docker-compose rm -f stripe-cli
```

## Testing

After setup, test the webhook:

1. Make a test payment using card `4242 4242 4242 4242`
2. Watch the logs: `bun run stripe:webhook:logs`
3. You should see events like:
   ```
   --> checkout.session.completed [200]
   --> payment_intent.succeeded [200]
   ```
4. Check your database - the debt status should be updated to `PAID`

## Production

For production, you don't need this tunnel. Instead:
1. Go to your Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy the webhook signing secret to your production environment variables

