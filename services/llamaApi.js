const openai = require('openai');

const client = new openai({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

async function sendMessage(message, res, chat, language) {
  try {

    const conversationHistory = chat.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    console.log(language);

    const stream = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a programming assistant with expertise in ${language}. 
          Your role involves building, refactoring and debugging code written in ${language}.
          When refactoring code, you work step by step to ensure that the code you provide is a drop-in replacement for the source code, written in ${language}.
          If the user asks a non coding related question, answer very shortly, and ask if they have a coding question.`,
        },
        ...conversationHistory,
      ],
      model: 'meta-llama/Llama-3-8b-chat-hf',
      max_tokens: 1024,
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let assistantResponse = '';

    for await (const chunk of stream) {
      const token = chunk.choices[0].text;
      assistantResponse += token;
      res.write(`${token}`);
    }

    chat.messages.push({
      role: 'assistant',
      content: assistantResponse,
    });

    await chat.save();

    res.write(`data: ${JSON.stringify({ chatId: chat._id })}\n\n`);
    res.end();

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  catch (err) {
    console.error(`Error: ${err}`);
  }
}

module.exports = sendMessage;