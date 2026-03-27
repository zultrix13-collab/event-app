import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from './embeddings';
import type { KbChunk } from './types';

export async function hybridSearch(query: string, topK: number = 5): Promise<KbChunk[]> {
  const supabase = getSupabaseAdminClient();

  // 1. Generate query embedding
  const embedding = await generateEmbedding(query);

  // 2. Semantic search
  const { data: semanticResults } = await supabase.rpc('search_kb_chunks', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: topK,
  });

  // 3. Keyword search
  const { data: keywordResults } = await supabase.rpc('search_kb_keyword', {
    query_text: query,
    match_count: topK,
  });

  // 4. Merge and deduplicate (reciprocal rank fusion)
  const seen = new Set<string>();
  const merged: KbChunk[] = [];

  for (const r of (semanticResults ?? [])) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      merged.push({
        id: r.id,
        documentId: r.document_id,
        content: r.content,
        contentEn: r.content_en,
        similarity: r.similarity,
      });
    }
  }
  for (const r of (keywordResults ?? [])) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      merged.push({
        id: r.id,
        documentId: r.document_id,
        content: r.content,
        contentEn: r.content_en,
      });
    }
  }

  return merged.slice(0, topK);
}
