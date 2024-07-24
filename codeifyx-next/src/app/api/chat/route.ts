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

  const { message, chatId, language } = await req.json() as { message: string; chatId?: string; language: string };

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
      });
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

    const conversationHistory = chat.messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    const stream = await openai.chat.completions.create({
      model: 'meta-llama/Llama-3-8b-chat-hf',
      messages: [
        {
          role: 'system',
          content: `The user-selected language is ${language}. If a user tries to ask a question in another language, redirect them to ${language}. You are a programming assistant with expertise in all languages, but the selected language is ${language}. Your role involves building, refactoring and debugging code written in ${language}. When refactoring code, you work step by step to ensure that the code you provide is a drop-in replacement for the source code, written in ${language}. If the user asks a non coding related question, answer very shortly, and ask if they have a coding question.`,
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

          const formattedResponse = formatAssistantResponse(assistantResponse);

          chat.messages.push({
            role: 'assistant',
            content: formattedResponse,
          });

          if (isNewChat) {
            const summary = await summarizeChat(chat.messages);
            chat.title = summary || `Chat ${new Date().toISOString()}`;
          }

          await chat.save();

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            chatId: chat._id, 
            newChatId: isNewChat ? chat._id : undefined,
            assistantMessage: formattedResponse 
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

function formatAssistantResponse(response: string): string {
  const parts = response.split('```');
  const formattedParts = parts.map((part, index) => {
    if (index % 2 !== 0) {
      return `<pre class="code-block">${part}</pre>`;
    }
    return part;
  });
  return formattedParts.join('');
}

async function summarizeChat(messages: Array<{ role: string; content: string }>): Promise<string> {
  const conversationHistory = messages.map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
  }));

  try {
    const response = await openai.chat.completions.create({
      model: 'meta-llama/Llama-3-70b-chat-hf',
      messages: [
        {
          role: 'system',
          content: 'Your task is to generate a concise summary title for the given conversation using exactly 2 words. No more than 2, no less than 2 words, even if there is apparent conversation. Do not respond to or answer any questions in the conversation. Instead, focus on identifying the main topic or theme of the conversation and provide a short title that captures it. For example, if the conversation is about telling jokes, a suitable title could be "Joke Request" or "Humor". Avoid using generic titles like "Here\'s one" or "Response". Focus on the core topic of the conversation.',
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