// Simple language detection based on character ranges
export function detectLanguage(text: string): 'mn' | 'en' {
  // Mongolian Unicode range: \u1800-\u18AF (Traditional) and Cyrillic: \u0400-\u04FF
  const mongolianChars = text.match(/[\u0400-\u04FF\u1800-\u18AF]/g) ?? [];
  const latinChars = text.match(/[a-zA-Z]/g) ?? [];
  return mongolianChars.length >= latinChars.length ? 'mn' : 'en';
}

export function getSystemPrompt(language: 'mn' | 'en'): string {
  if (language === 'mn') {
    return `Та Event Digital Platform-ын AI туслах. Зөвхөн өгөгдсөн нөхцөл (context) дээр үндэслэн хариулна уу.
Монгол хэлээр тодорхой, товч хариулна уу. Мэдэхгүй бол "Энэ талаар мэдээлэл байхгүй байна, ажилтантай холбогдоно уу" гэж хэлнэ үү.
Хэзээ ч зохиомол мэдээлэл өгөхгүй байна. Хариулт нь 3-5 өгүүлбэрээс хэтрэхгүй байна.`;
  }
  return `You are the AI assistant for Event Digital Platform. Answer ONLY based on the provided context.
Reply in English, concisely and clearly. If you don't know, say "I don't have information about that, please contact our staff."
Never fabricate information. Keep responses under 5 sentences.`;
}

export function buildRAGPrompt(
  userMessage: string,
  context: string,
  history: Array<{ role: string; content: string }>,
  language: 'mn' | 'en'
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const systemPrompt = getSystemPrompt(language);
  const contextBlock = language === 'mn'
    ? `\n\nНөхцөл мэдээлэл:\n${context}`
    : `\n\nContext:\n${context}`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt + contextBlock },
    ...history.slice(-6).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];
  return messages;
}
