import { generateEmbeddings } from './embeddings';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
    if (i + chunkSize >= words.length) break;
  }
  return chunks.filter(c => c.trim().length > 20);
}

export async function indexDocument(documentId: string): Promise<{ success: boolean; chunksCreated: number }> {
  const supabase = getSupabaseAdminClient();

  const { data: doc } = await supabase
    .from('kb_documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (!doc) return { success: false, chunksCreated: 0 };

  // Delete existing chunks
  await supabase.from('kb_chunks').delete().eq('document_id', documentId);

  // Create chunks
  const mnChunks = chunkText(doc.content);
  const enChunks = doc.content_en ? chunkText(doc.content_en) : [];

  const maxLen = Math.max(mnChunks.length, enChunks.length);
  const allChunks = Array.from({ length: maxLen }, (_, i) => ({
    mn: mnChunks[i] ?? '',
    en: enChunks[i] ?? null,
  })).filter(c => c.mn.length > 0);

  // Generate embeddings in batches of 20
  const batchSize = 20;
  let created = 0;
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    const texts = batch.map(c => c.mn + (c.en ? ' ' + c.en : ''));
    const embeddings = await generateEmbeddings(texts);

    const rows = batch.map((c, j) => ({
      document_id: documentId,
      chunk_index: i + j,
      content: c.mn,
      content_en: c.en,
      embedding: embeddings[j],
      token_count: texts[j].split(/\s+/).length,
    }));

    await supabase.from('kb_chunks').insert(rows);
    created += rows.length;
  }

  return { success: true, chunksCreated: created };
}

export async function reindexAll(): Promise<{ success: boolean; total: number }> {
  const supabase = getSupabaseAdminClient();
  const { data: docs } = await supabase.from('kb_documents').select('id').eq('is_active', true);
  if (!docs) return { success: false, total: 0 };
  let total = 0;
  for (const doc of docs) {
    const result = await indexDocument(doc.id);
    if (result.success) total += result.chunksCreated;
  }
  return { success: true, total };
}
