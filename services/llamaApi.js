const openai = require('openai');

const client = new openai({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

async function sendMessage(message, res, chat) {
  try {

    const conversationHistory = chat.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const stream = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a coding assistant. Try to keep things coding related. Things that are not very coding related you should answer shortly.',
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