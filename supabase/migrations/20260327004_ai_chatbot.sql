-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base documents
CREATE TABLE IF NOT EXISTS kb_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_en text,
  content text NOT NULL,
  content_en text,
  category text DEFAULT 'general' CHECK (category IN ('programme', 'faq', 'venue', 'service', 'general', 'emergency')),
  source_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document chunks with embeddings
CREATE TABLE IF NOT EXISTS kb_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES kb_documents(id) ON DELETE CASCADE,
  chunk_index int NOT NULL,
  content text NOT NULL,
  content_en text,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  token_count int,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_doc ON kb_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_embedding ON kb_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Conversation sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_token text UNIQUE DEFAULT gen_random_uuid()::text, -- for anonymous users
  language text DEFAULT 'mn' CHECK (language IN ('mn', 'en')),
  started_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  is_escalated boolean DEFAULT false, -- handed off to human operator
  escalated_at timestamptz
);

-- Conversation messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  language text DEFAULT 'mn',
  retrieved_chunk_ids uuid[], -- which chunks were used
  tokens_used int,
  response_time_ms int,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- Human handoff queue
CREATE TABLE IF NOT EXISTS operator_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'assigned', 'resolved')),
  assigned_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- RLS
ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_handoffs ENABLE ROW LEVEL SECURITY;

-- Public can read active kb docs
CREATE POLICY "Public read kb_documents" ON kb_documents FOR SELECT USING (is_active = true);
CREATE POLICY "Public read kb_chunks" ON kb_chunks FOR SELECT USING (true);

-- Chat sessions - users own their sessions
CREATE POLICY "Users manage own sessions" ON chat_sessions FOR ALL USING (
  auth.uid() = user_id OR user_id IS NULL
);
CREATE POLICY "Users read own messages" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND (user_id = auth.uid() OR user_id IS NULL))
);
CREATE POLICY "Insert messages" ON chat_messages FOR INSERT WITH CHECK (true);

-- Admins manage kb
CREATE POLICY "Admins manage kb_documents" ON kb_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
CREATE POLICY "Admins manage kb_chunks" ON kb_chunks FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
CREATE POLICY "Admins view handoffs" ON operator_handoffs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);

-- Semantic search function
CREATE OR REPLACE FUNCTION search_kb_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  content_en text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb_chunks.id,
    kb_chunks.document_id,
    kb_chunks.content,
    kb_chunks.content_en,
    1 - (kb_chunks.embedding <=> query_embedding) AS similarity
  FROM kb_chunks
  WHERE 1 - (kb_chunks.embedding <=> query_embedding) > match_threshold
    AND kb_chunks.embedding IS NOT NULL
  ORDER BY kb_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Keyword search function (BM25-like using ts_rank)
CREATE OR REPLACE FUNCTION search_kb_keyword(
  query_text text,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  content_en text,
  rank float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb_chunks.id,
    kb_chunks.document_id,
    kb_chunks.content,
    kb_chunks.content_en,
    ts_rank(
      to_tsvector('simple', kb_chunks.content || ' ' || COALESCE(kb_chunks.content_en, '')),
      plainto_tsquery('simple', query_text)
    )::float AS rank
  FROM kb_chunks
  WHERE to_tsvector('simple', kb_chunks.content || ' ' || COALESCE(kb_chunks.content_en, ''))
    @@ plainto_tsquery('simple', query_text)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
