import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Chat from '@/models/Chat';
import { getSession } from '@/utils/session';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chats = await Chat.find({ user: session.userId })
      .select('_id title language updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10);

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}