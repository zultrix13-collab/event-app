import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { indexDocument } from '@/modules/ai/indexer';

type KbDocInsert = {
  title: string;
  title_en?: string | null;
  content: string;
  content_en?: string | null;
  category?: 'programme' | 'faq' | 'venue' | 'service' | 'general' | 'emergency';
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as {
    title: string;
    title_en?: string;
    content: string;
    content_en?: string;
    category?: string;
  };

  const validCategories = ['programme', 'faq', 'venue', 'service', 'general', 'emergency'] as const;
  type Category = typeof validCategories[number];
  const category: Category = (validCategories.includes(body.category as Category) ? body.category : 'general') as Category;

  const insert: KbDocInsert = {
    title: body.title,
    title_en: body.title_en ?? null,
    content: body.content,
    content_en: body.content_en ?? null,
    category,
  };

  const { data: doc, error } = await supabase
    .from('kb_documents')
    .insert(insert)
    .select('id')
    .single();

  if (error ?? !doc) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 });
  }

  // Trigger indexing (non-blocking attempt — if OPENAI_API_KEY missing, skip gracefully)
  try {
    await indexDocument(doc.id);
  } catch (e) {
    console.warn('Indexing skipped (no API key or error):', e);
  }

  return NextResponse.json({ success: true, documentId: doc.id });
}
