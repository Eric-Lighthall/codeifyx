const openai = require('openai');

const client = new openai({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});
async function sendMessage(message, res) {
  try {
    const stream = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You will answer whatever the user asks.',
        },
        {
          role: 'user',
          content: message,
        },
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

    for await (const chunk of stream) {
      const token = chunk.choices[0].text;
      res.write(`${token}`);
    }
    res.end();
  }
  catch (err) {
    console.error(`Error: ${err}`);
  }
}

module.exports = sendMessage;