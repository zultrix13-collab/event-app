import { NextRequest, NextResponse } from 'next/server';
import { processChat } from '@/modules/ai/chat';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { message?: string; sessionId?: string; history?: Array<{ role: string; content: string }> };
    const { message, sessionId, history = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Get or create chat session in DB
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let activeSessionId: string = sessionId ?? '';
    if (!activeSessionId) {
      const { data: session } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user?.id ?? null })
        .select('id')
        .single();
      activeSessionId = session?.id ?? crypto.randomUUID();
    }

    // Save user message
    await supabase.from('chat_messages').insert({
      session_id: activeSessionId,
      role: 'user',
      content: message,
    });

    const response = await processChat({ message, sessionId: activeSessionId, history });

    // Save assistant message
    await supabase.from('chat_messages').insert({
      session_id: activeSessionId,
      role: 'assistant',
      content: response.message,
      language: response.language,
      retrieved_chunk_ids: response.sources.length > 0 ? response.sources : null,
    });

    // Handle escalation
    if (response.shouldEscalate) {
      await supabase
        .from('chat_sessions')
        .update({ is_escalated: true, escalated_at: new Date().toISOString() })
        .eq('id', activeSessionId);
      await supabase.from('operator_handoffs').insert({
        session_id: activeSessionId,
        user_id: user?.id ?? null,
        reason: message,
      });
    }

    return NextResponse.json({
      message: response.message,
      sessionId: activeSessionId,
      language: response.language,
      shouldEscalate: response.shouldEscalate,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 500 });
  }
}
