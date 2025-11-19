import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma, handlePrismaError } from '@/lib/prisma';
import Stripe from 'stripe';

// Configure route to receive raw body for signature verification
export const runtime = 'nodejs';

// Next.js 13+ App Router: Disable body parsing to get raw body
export const dynamic = 'force-dynamic';

enum DebtStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get debt ID from session metadata
        const debtId = session.metadata?.debtId;

        if (!debtId) {
          console.error('No debtId in session metadata');
          return NextResponse.json(
            { error: 'Missing debtId in session metadata' },
            { status: 400 }
          );
        }

        // Only process if payment_status is 'paid'
        if (session.payment_status === 'paid') {
          // Get payment intent ID or session ID
          const paymentId = session.payment_intent as string || session.id;

          // Update debt status in database
          await prisma.debt.update({
            where: { id: parseInt(debtId) },
            data: {
              status: DebtStatus.PAID,
              stripePaymentId: paymentId,
              updatedAt: new Date(),
            },
          });

          console.log(`Debt ${debtId} marked as paid. Payment ID: ${paymentId}`);
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Try to find debt by payment intent ID (if stored in metadata)
        // Alternatively, find by customer email
        const customerEmail = paymentIntent.metadata?.email;

        if (customerEmail) {
          // Find debt by email
          const debt = await prisma.debt.findUnique({
            where: { email: customerEmail },
          });

          if (debt && debt.status === DebtStatus.PENDING) {
            // Update debt status
            await prisma.debt.update({
              where: { id: debt.id },
              data: {
                status: DebtStatus.PAID,
                stripePaymentId: paymentIntent.id,
                updatedAt: new Date(),
              },
            });

            console.log(
              `Debt ${debt.id} marked as paid via payment_intent. Payment ID: ${paymentIntent.id}`
            );
          }
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 OK to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

