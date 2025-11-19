import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma, handlePrismaError } from '@/lib/prisma';
import { handleStripeError } from '@/lib/stripe-errors';

enum DebtStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { debtId, email } = body;

    if (!debtId && !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either debtId or email is required',
        },
        { status: 400 }
      );
    }

    // Fetch debt from database
    const debt = debtId
      ? await prisma.debt.findUnique({ where: { id: parseInt(debtId) } })
      : await prisma.debt.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!debt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Debt not found',
        },
        { status: 404 }
      );
    }

    // Check if debt is already paid
    if (debt.status === DebtStatus.PAID) {
      return NextResponse.json(
        {
          success: false,
          error: 'This debt has already been paid',
        },
        { status: 400 }
      );
    }

    // Convert debt amount to cents (Stripe uses cents)
    const amountInCents = Math.round(parseFloat(debt.debtAmount.toString()) * 100);

    if (amountInCents <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid debt amount',
        },
        { status: 400 }
      );
    }

    // Get base URL from environment or request
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   request.headers.get('origin') || 
                   'http://localhost:3000';

    // Create Stripe Checkout Session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: debt.debtSubject,
              description: `Paiement de la dette pour ${debt.name}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/debtor/${encodeURIComponent(debt.email)}?canceled=true`,
      metadata: {
        debtId: debt.id.toString(),
        email: debt.email,
        name: debt.name,
        debtSubject: debt.debtSubject,
      },
      customer_email: debt.email,
      });
    } catch (stripeError) {
      const stripeErrorHandled = handleStripeError(stripeError);
      console.error('Stripe error creating session:', stripeError);
      return NextResponse.json(
        {
          success: false,
          error: stripeErrorHandled.userMessage,
          code: stripeErrorHandled.code,
          message: stripeErrorHandled.message,
        },
        { status: stripeErrorHandled.statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating payment session:', error);
    
    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = handlePrismaError(error);
      return NextResponse.json(
        {
          success: false,
          error: prismaError.message,
          code: prismaError.code,
        },
        { status: prismaError.statusCode }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

