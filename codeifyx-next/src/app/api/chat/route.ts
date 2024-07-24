import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { connectDB } from '@/utils/db';
import User from '@/models/User';
import Chat from '@/models/Chat';
import { getSession } from '@/utils/session';

const openai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

export async function POST(req: NextRequest) {
  await connectDB();

  const session = await getSession(req);
  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, chatId, language, action } = await req.json() as { message: string; chatId?: string; language: string; action: string };

  try {
    const user = await User.findById(session.userId);
    if (!user || !user.isVerified) {
      return NextResponse.json({ error: 'User not found or not verified' }, { status: 401 });
    }

    let chat;
    let isNewChat = false;

    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: user._id });

      if (!chat) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }

      chat.messages.push({
        role: 'user',
        content: message,
        action: action,
      });
    } else {
      chat = new Chat({
        user: user._id,
        title: `New ${language} Chat`,
        language,
        messages: [{
          role: 'user',
          content: message,
          action: action,
        }],
      });
      isNewChat = true;
    }

    if (!chat.title) {
      chat.title = `Chat ${new Date().toISOString()}`;
    }

    await chat.save();

    const conversationHistory = chat.messages.map((msg: { role: string; content: string; action?: string }) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.role === 'user' ? `${msg.action?.toUpperCase()} REQUEST:\n\n${msg.content}` : msg.content,
    }));

    const stream = await openai.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3-8B-Instruct-Turbo',
      messages: [
        {
          role: 'system',
          content: `
          You are a coding assistant. 
          Focus on writing, helping with, and debugging code.
          Use comments for non-code. 
          The user's current action is: ${action}.
          Never use \`\`\` to start and end a script.
          `,
        },
        ...conversationHistory,
      ],
      max_tokens: 1024,
      stream: true,
    });

    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          let assistantResponse = '';

          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content || '';
            assistantResponse += token;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
          }

          chat.messages.push({
            role: 'assistant',
            content: assistantResponse,
          });

          if (isNewChat) {
            const summary = await summarizeChat(chat.messages);
            chat.title = summary || `Chat ${new Date().toISOString()}`;
          }

          await chat.save();

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            chatId: chat._id, 
            newChatId: isNewChat ? chat._id : undefined,
            assistantMessage: assistantResponse 
          })}\n\n`));
        } catch (error) {
          console.error('Error in stream processing:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'An error occurred during processing' })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

async function summarizeChat(messages: Array<{ role: string; content: string; action?: string }>): Promise<string> {
  const conversationHistory = messages.map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.role === 'user' ? `${msg.action?.toUpperCase()} REQUEST:\n\n${msg.content}` : msg.content,
  }));

  try {
    const response = await openai.chat.completions.create({
      model: 'meta-llama/Llama-3-70b-chat-hf',
      messages: [
        {
          role: 'system',
          content: 'Generate a concise 2-word title for the given coding conversation. Focus on the main programming topic or action discussed.',
        },
        ...conversationHistory,
      ],
      max_tokens: 4,
    });

    const summary = response.choices[0].message?.content || '';
    return summary.replace(/['"]+/g, '');
  } catch (error) {
    console.error('Error generating summary:', error);
    return '';
  }
}