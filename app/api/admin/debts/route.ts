import { NextRequest, NextResponse } from 'next/server';
import { prisma, handlePrismaError } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { debtSubject: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Get total count for pagination
    const total = await prisma.debt.count({ where });

    // Fetch debts with pagination
    const debts = await prisma.debt.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        paymentHistory: {
          orderBy: {
            paidAt: 'desc',
          },
          take: 5, // Get last 5 payments
        },
      },
    });

    // Format response
    const formattedDebts = debts.map((debt) => ({
      id: debt.id,
      name: debt.name,
      email: debt.email,
      debtSubject: debt.debtSubject,
      debtAmount: debt.debtAmount.toString(),
      status: debt.status,
      stripePaymentId: debt.stripePaymentId,
      createdAt: debt.createdAt.toISOString(),
      updatedAt: debt.updatedAt.toISOString(),
      paymentHistory: debt.paymentHistory.map((payment) => ({
        id: payment.id,
        amount: payment.amount.toString(),
        stripePaymentId: payment.stripePaymentId,
        status: payment.status,
        paidAt: payment.paidAt.toISOString(),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: formattedDebts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching debts:', error);
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

