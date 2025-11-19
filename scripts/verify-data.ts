import { prisma } from '../lib/prisma';

async function verifyData() {
  try {
    const debts = await prisma.debt.findMany({
      orderBy: { createdAt: 'asc' },
    });

    console.log(`\n✓ Total debts in database: ${debts.length}\n`);
    
    debts.forEach((debt) => {
      console.log(`- ${debt.name} (${debt.email})`);
      console.log(`  Subject: ${debt.debtSubject}`);
      console.log(`  Amount: ${debt.debtAmount}`);
      console.log(`  Status: ${debt.status}`);
      console.log('');
    });

    console.log('✓ All data verified successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();

