import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    try {
      const admin = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
      return NextResponse.json({
        success: true,
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
        },
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session',
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred',
      },
      { status: 500 }
    );
  }
}

