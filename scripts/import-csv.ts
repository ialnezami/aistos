import { parseCSVFile } from '../lib/csv-parser';
import { prisma } from '../lib/prisma';
import { DebtStatus } from '@prisma/client';
import path from 'path';

async function importCSV() {
  try {
    const csvFilePath = path.join(process.cwd(), 'file.csv');
    console.log(`Reading CSV file from: ${csvFilePath}`);

    // Parse CSV file
    const parseResult = await parseCSVFile(csvFilePath);

    if (!parseResult.success || !parseResult.data) {
      console.error('Failed to parse CSV:', parseResult.errors);
      process.exit(1);
    }

    console.log(`\nParsed ${parseResult.validRows} valid rows from CSV`);

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

        // Use upsert to handle duplicates
        await prisma.debt.upsert({
          where: {
            email: debt.email,
          },
          update: {
            name: debt.name,
            debtSubject: debt.debtSubject,
            debtAmount: debt.debtAmount,
            // Only update status if it's still PENDING (don't overwrite PAID status)
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
          console.log(`✓ Updated: ${debt.email}`);
        } else {
          importResults.created++;
          console.log(`✓ Created: ${debt.email} - ${debt.name}`);
        }
      } catch (error) {
        const errorMessage = `Failed to import ${debt.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        importResults.errors.push(errorMessage);
        console.error(`✗ ${errorMessage}`);
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total rows processed: ${parseResult.validRows}`);
    console.log(`Created: ${importResults.created}`);
    console.log(`Updated: ${importResults.updated}`);
    console.log(`Errors: ${importResults.errors.length}`);

    if (importResults.errors.length > 0) {
      console.log('\nErrors:');
      importResults.errors.forEach((error) => console.error(`  - ${error}`));
    }

    if (parseResult.errors.length > 0) {
      console.log('\nParse warnings:');
      parseResult.errors.forEach((error) => console.warn(`  - ${error}`));
    }

    console.log('\n✓ Import completed successfully!');
  } catch (error) {
    console.error('Import error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importCSV();

