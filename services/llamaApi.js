const openai = require('openai');

// create togetherapi client
const client = new openai({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

// send message & generate response
async function sendMessage(message, res, chat, language) {
  try {
    // build conversation history before sending to api
    const conversationHistory = chat.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const stream = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `The user-selected langugage is ${language}.
          If a user tries to ask a question in another langugage, redirect them to ${language}.
          You are a programming assistant with expertise in all languages, but the selected language is ${language}. 
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

    // loop through each chunk as its streamed in
    for await (const chunk of stream) {
      const token = chunk.choices[0].text;
      assistantResponse += token;
      res.write(token);
    }

    // format response for code blocks
    const formattedResponse = formatAssistantResponse(assistantResponse);

    chat.messages.push({
      role: 'assistant',
      content: formattedResponse,
    });

    await chat.save();

    res.write(`data: ${JSON.stringify({ chatId: chat._id, formattedResponse: formattedResponse })}\n\n`);
    res.end();

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  catch (err) {
    console.error(`Error: ${err}`);
  }
}

// format code blocks
function formatAssistantResponse(response) {
  const parts = response.split('```');
  const formattedParts = parts.map((part, index) => {
    if (index % 2 !== 0) {
      return `<pre class="code-block">${part}</pre>`;
    }
    return part;
  });
  return formattedParts.join('');
}

// generate a summary of the chat using Llama-3-70b
const summarizeChat = async (messages) => {
  const conversationHistory = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  const response = await client.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Your task is to generate a concise summary title for the given conversation using exactly 2 words. No more than 2, no less than 2 words, even if there is apparent conversation. Do not respond to or answer any questions in the conversation. Instead, focus on identifying the main topic or theme of the conversation and provide a short title that captures it. For example, if the conversation is about telling jokes, a suitable title could be "Joke Request" or "Humor". Avoid using generic titles like "Here\'s one" or "Response". Focus on the core topic of the conversation.',
      },
      ...conversationHistory,
    ],
    model: 'meta-llama/Llama-3-70b-chat-hf',
    max_tokens: 4,
  });

  // extract summary and rempove quotes
  const summary = response.choices[0].message.content;
  const strippedSummary = summary.replace(/['"]+/g, '');

  return strippedSummary;
};


module.exports = {
  sendMessage,
  summarizeChat
};