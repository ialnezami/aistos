import { NextRequest, NextResponse } from 'next/server';
import { parseCSVFile } from '@/lib/csv-parser';
import { prisma, handlePrismaError } from '@/lib/prisma';
import { sendDebtCreationEmail } from '@/lib/email';
import { DebtStatus } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    // Get CSV file path from request body or use default
    const body = await request.json().catch(() => ({}));
    const csvFilePath = body.filePath || path.join(process.cwd(), 'file.csv');

    // Check if file exists
    try {
      await fs.access(csvFilePath);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `CSV file not found at: ${csvFilePath}`,
        },
        { status: 404 }
      );
    }

    // Parse CSV file
    const parseResult = await parseCSVFile(csvFilePath);

    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json(
        {
          success: false,
          errors: parseResult.errors,
          totalRows: parseResult.totalRows,
          validRows: parseResult.validRows,
          invalidRows: parseResult.invalidRows,
        },
        { status: 400 }
      );
    }

    // Import data into database
    const importResults = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    for (const debt of parseResult.data) {
      try {
        // Check if debt already exists
        const existingDebt = await prisma.debt.findUnique({
          where: { email: debt.email },
        });

        // Use upsert to handle duplicates (update if exists, create if not)
        await prisma.debt.upsert({
          where: {
            email: debt.email,
          },
          update: {
            name: debt.name,
            debtSubject: debt.debtSubject,
            debtAmount: debt.debtAmount,
            // Only update status if it's still PENDING (don't overwrite PAID status)
            // If already PAID, keep it as PAID
            ...(existingDebt?.status === DebtStatus.PAID
              ? {}
              : { status: DebtStatus.PENDING }),
            updatedAt: new Date(),
          },
          create: {
            name: debt.name,
            email: debt.email,
            debtSubject: debt.debtSubject,
            debtAmount: debt.debtAmount,
            status: DebtStatus.PENDING,
          },
        });

        // Track whether this was a create or update
        if (existingDebt) {
          importResults.updated++;
        } else {
          importResults.created++;
          
          // Send notification email for new debts
          try {
            await sendDebtCreationEmail(
              debt.email,
              debt.name,
              debt.debtAmount.toString(),
              debt.debtSubject
            );
          } catch (emailError) {
            console.error(`Failed to send email to ${debt.email}:`, emailError);
            // Don't fail the import if email fails
          }
        }
      } catch (error) {
        const prismaError = handlePrismaError(error);
        importResults.errors.push(
          `Failed to import ${debt.email}: ${prismaError.message}`
        );
        console.error(`Import error for ${debt.email}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: parseResult.totalRows,
        validRows: parseResult.validRows,
        invalidRows: parseResult.invalidRows,
        created: importResults.created,
        updated: importResults.updated,
        totalProcessed: importResults.created + importResults.updated,
      },
      parseErrors: parseResult.errors.length > 0 ? parseResult.errors : undefined,
      importErrors: importResults.errors.length > 0 ? importResults.errors : undefined,
    });
  } catch (error) {
    console.error('Import error:', error);
    
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

// GET endpoint to check import status or get sample
export async function GET() {
  return NextResponse.json({
    message: 'CSV Import API',
    usage: {
      method: 'POST',
      endpoint: '/api/debts/import',
      body: {
        filePath: 'optional - path to CSV file (defaults to ./file.csv)',
      },
    },
    example: {
      filePath: './file.csv',
    },
  });
}

