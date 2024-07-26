// app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { connectDB } from '@/utils/db';
import User from '@/models/User';
import Chat from '@/models/Chat';
import { getSession } from '@/utils/session';

const client = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function POST(req: NextRequest) {
  await connectDB();

  const session = await getSession(req);
  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, chatId, language, action, systemPrompt, instruction } = await req.json() as { 
    message: string; 
    chatId?: string; 
    language: string;
    action: string;
    systemPrompt: string;
    instruction: string;
  };

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

      // Update the user message
      chat.messages = [{
        role: 'user',
        content: message,
      }];
    } else {
      chat = new Chat({
        user: user._id,
        title: `New ${language} Chat`,
        language,
        messages: [{
          role: 'user',
          content: message,
        }],
      });
      isNewChat = true;
    }

    if (!chat.title) {
      chat.title = `Chat ${new Date().toISOString()}`;
    }

    await chat.save();

    // Prepare messages for AI
    const messages: Message[] = [
      {
        role: 'system',
        content: `${systemPrompt} You are a coding assistant specialized in ${language}. The user's current action is: ${action.toUpperCase()}. ${instruction ? 'Custom instruction: ' + instruction : ''}`,
      },
      {
        role: 'user',
        content: message,
      },
    ];

    const stream = await client.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3-8B-Instruct-Turbo',
      messages: messages,
      max_tokens: 1024,
      stream: true,
      temperature: 0.3,
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

          // Update the chat with the new assistant response
          chat.messages.push({
            role: 'assistant',
            content: assistantResponse,
          });

          // Only keep the last two messages
          if (chat.messages.length > 2) {
            chat.messages = chat.messages.slice(-2);
          }

          if (isNewChat) {
            const summary = await summarizeChat(chat.messages, action);
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

async function summarizeChat(messages: Message[], action: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: 'meta-llama/Llama-3-70b-chat-hf',
      messages: [
        {
          role: 'system',
          content: `Generate a concise 2-word title for the given coding conversation. The conversation is about a ${action.toUpperCase()} action. Focus on the main programming topic discussed.`,
        },
        ...messages,
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