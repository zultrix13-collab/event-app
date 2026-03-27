import OpenAI from 'openai';
import { hybridSearch } from './retrieval';
import { detectLanguage, buildRAGPrompt } from './language';
import type { ChatResponse, KbChunk } from './types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ESCALATION_PHRASES = [
  'human', 'operator', 'staff', 'person', 'ажилтан', 'хүн', 'оператор', 'холбогдох'
];

export async function processChat(params: {
  message: string;
  sessionId: string;
  history: Array<{ role: string; content: string }>;
}): Promise<ChatResponse> {
  const { message, sessionId, history } = params;
  const language = detectLanguage(message);

  // Check for escalation request
  const shouldEscalate = ESCALATION_PHRASES.some(p =>
    message.toLowerCase().includes(p)
  );

  if (shouldEscalate) {
    return {
      message: language === 'mn'
        ? 'Ажилтантай холбоно уу. Таны хүсэлтийг дамжуулж байна...'
        : 'Connecting you to a staff member. Please wait...',
      language,
      sources: [],
      sessionId,
      shouldEscalate: true,
    };
  }

  // Retrieve relevant chunks
  let chunks: KbChunk[] = [];
  let context = '';
  try {
    chunks = await hybridSearch(message, 5);
    if (chunks.length > 0) {
      context = chunks.map((c, i) =>
        `[${i + 1}] ${language === 'mn' ? c.content : (c.contentEn ?? c.content)}`
      ).join('\n\n');
    }
  } catch (e) {
    // If retrieval fails, continue without context
    console.error('Retrieval error:', e);
  }

  // If no context found, give graceful response
  if (!context) {
    return {
      message: language === 'mn'
        ? 'Уучлаарай, энэ талаар мэдээлэл олдсонгүй. Бид тантай холбогдоход туслах болно.'
        : 'Sorry, I could not find information about that. Please contact our support team.',
      language,
      sources: [],
      sessionId,
      shouldEscalate: false,
    };
  }

  const promptMessages = buildRAGPrompt(message, context, history, language);

  const startTime = Date.now();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: promptMessages,
    max_tokens: 500,
    temperature: 0.3,
  });

  const responseTime = Date.now() - startTime;
  void responseTime; // logged elsewhere via chat_messages table
  const assistantMessage = completion.choices[0].message.content ?? '';

  return {
    message: assistantMessage,
    language,
    sources: chunks.map(c => c.id),
    sessionId,
    shouldEscalate: false,
  };
}
