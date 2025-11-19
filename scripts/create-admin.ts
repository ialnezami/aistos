import { createAdmin } from '../lib/auth';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: bun run scripts/create-admin.ts <username> <password> <email>');
    process.exit(1);
  }

  const [username, password, email] = args;

  console.log('Creating admin user...');
  const admin = await createAdmin(username, password, email);

  if (admin) {
    console.log('Admin user created successfully!');
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
  } else {
    console.error('Failed to create admin user. It may already exist.');
    process.exit(1);
  }
}

main();

