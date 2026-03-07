import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Since this is a demo without seed data immediately available, 
    // we use a hardcoded fallback or simply trust the first login to set standard admin entry.
    // In production, you would hash password and check against Admin DB model.
    if (username === 'admin' && password === 'admin123') {
      const response = NextResponse.json({ success: true }, { status: 200 });
      // Set secure HTTP-only cookie
      response.cookies.set('admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
