const openai = require('openai');

const client = new openai({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

let conversationHistory = [];

async function sendMessage(message, res) {
  try {

    conversationHistory.push({
      role: 'user',
      content: message,
    });

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

    conversationHistory.push({
      role: 'assistant',
      content: assistantResponse,
    });

    res.end();

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  catch (err) {
    console.error(`Error: ${err}`);
  }
}

module.exports = sendMessage;