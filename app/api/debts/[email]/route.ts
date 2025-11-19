import { NextRequest, NextResponse } from 'next/server';
import { prisma, handlePrismaError } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email);

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email address',
        },
        { status: 400 }
      );
    }

    // Fetch debt from database
    const debt = await prisma.debt.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (!debt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Debt not found for this email address',
        },
        { status: 404 }
      );
    }

    // Convert Decimal to number for JSON response
    return NextResponse.json({
      success: true,
      data: {
        id: debt.id,
        name: debt.name,
        email: debt.email,
        debtSubject: debt.debtSubject,
        debtAmount: debt.debtAmount.toString(),
        status: debt.status,
        stripePaymentId: debt.stripePaymentId,
        createdAt: debt.createdAt.toISOString(),
        updatedAt: debt.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching debt:', error);
    
    // Handle Prisma errors
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
}

