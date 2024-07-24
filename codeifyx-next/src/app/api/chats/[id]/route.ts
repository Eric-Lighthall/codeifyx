// app/api/chats/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Chat from '@/models/Chat';
import { getSession } from '@/utils/session';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatId = params.id;

    const chat = await Chat.findOne({ _id: chatId, user: session.userId });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Return all necessary information in a single response
    return NextResponse.json({
      id: chat._id,
      title: chat.title,
      language: chat.language,
      messages: chat.messages,
      // Include any other relevant chat information here
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatId = params.id;

    const chat = await Chat.findOne({ _id: chatId, user: session.userId });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    await Chat.findByIdAndDelete(chatId);

    return NextResponse.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}