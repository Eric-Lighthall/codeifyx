import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface Session {
  userId: string;
}

export async function getSession(req: NextRequest): Promise<Session | null> {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    return { userId: decoded.userId };
  } catch (error) {
    console.error('Failed to decode session:', error);
    return null;
  }
}