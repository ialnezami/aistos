import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Handle Prisma database errors
 */
export function handlePrismaError(error: unknown): {
  message: string
  code?: string
  statusCode: number
} {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Known Prisma errors
    switch (error.code) {
      case 'P2002':
        return {
          message: 'Un enregistrement avec cette valeur existe déjà',
          code: error.code,
          statusCode: 409,
        }
      case 'P2025':
        return {
          message: 'Enregistrement introuvable',
          code: error.code,
          statusCode: 404,
        }
      case 'P2003':
        return {
          message: 'Violation de contrainte de clé étrangère',
          code: error.code,
          statusCode: 400,
        }
      default:
        console.error('Prisma error:', error)
        return {
          message: 'Erreur de base de données',
          code: error.code,
          statusCode: 500,
        }
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error('Prisma validation error:', error)
    return {
      message: 'Données invalides',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error('Prisma initialization error:', error)
    return {
      message: 'Impossible de se connecter à la base de données. Vérifiez votre configuration.',
      code: 'INIT_ERROR',
      statusCode: 503,
    }
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    console.error('Prisma panic error:', error)
    return {
      message: 'Erreur critique de la base de données',
      code: 'PANIC_ERROR',
      statusCode: 500,
    }
  }

  // Generic error
  console.error('Unknown Prisma error:', error)
  return {
    message: error instanceof Error ? error.message : 'Erreur de base de données inconnue',
    statusCode: 500,
  }
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

