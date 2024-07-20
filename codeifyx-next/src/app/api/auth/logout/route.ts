import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response object
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear the JWT token by setting an expired cookie
    response.cookies.set({
      name: 'token',
      value: '',
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Error during logout' }, { status: 500 });
  }
}