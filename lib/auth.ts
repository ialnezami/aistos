import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
}

/**
 * Verify admin credentials
 */
export async function verifyAdmin(
  username: string,
  password: string
): Promise<AdminUser | null> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return null;
    }

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
    };
  } catch (error) {
    console.error('Error verifying admin:', error);
    return null;
  }
}

/**
 * Create admin user (for initial setup)
 */
export async function createAdmin(
  username: string,
  password: string,
  email: string
): Promise<AdminUser | null> {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        email,
      },
    });

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
    };
  } catch (error) {
    console.error('Error creating admin:', error);
    return null;
  }
}

/**
 * Check if admin session is valid (simple session check)
 */
export function getAdminFromSession(sessionToken: string | null): AdminUser | null {
  // In a real app, you'd verify the session token with a session store
  // For now, we'll use a simple approach with NextAuth or session cookies
  // This is a placeholder - implement proper session management
  return null;
}

