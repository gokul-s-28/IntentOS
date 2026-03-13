/**
 * groqService.js
 * Sends a chat message to Groq's llama3-8b-8192 model using the OpenAI-compatible SDK.
 */
const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;

const groq = new OpenAI({
  apiKey,
  baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * Send a conversation to Groq and receive the AI reply.
 *
 * @param {string}   userMessage  - The user's latest message
 * @param {string}   topic        - Current workspace topic for context
 * @param {Array}    history      - Previous messages [{role, content}, ...]
 * @returns {Promise<string>}     - AI reply text
 */
const chat = async (userMessage, topic = '', history = []) => {
  const systemPrompt = topic
    ? `You are IntentOS AI, a smart and friendly study assistant helping a user learn about "${topic}". 
Provide clear, concise, and accurate answers. Format important terms in **bold**. 
Use numbered lists for steps and bullet points for concepts. Keep responses focused and educational.
Always relate your answers to the user's study topic when relevant.`
    : `You are IntentOS AI, a smart and friendly study assistant. 
Provide clear, concise, and accurate answers. Format important terms in **bold**. 
Use numbered lists for steps and bullet points for concepts.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10), // Keep last 10 messages for context window
    { role: 'user', content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || 'No response received.';
};

module.exports = { chat };
