import { NextRequest, NextResponse } from 'next/server';
import { validatePin, createSession, setSessionCookie } from '@/lib/auth';
import { LoginSchema } from '@/domain/contracts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = LoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid PIN format' },
        { status: 400 }
      );
    }

    const { pin } = result.data;

    // Validate PIN and get user
    const user = await validatePin(pin);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid PIN' },
        { status: 401 }
      );
    }

    // Create session
    const token = await createSession({
      id: user.id,
      name: user.name,
      role: user.role,
    });

    // Set cookie
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}

