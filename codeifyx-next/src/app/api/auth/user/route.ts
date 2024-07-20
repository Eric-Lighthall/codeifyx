import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/utils/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  await connectDB();

  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ email: user.email }, { status: 200 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}