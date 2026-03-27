import { NextRequest, NextResponse } from 'next/server';
import { indexDocument } from '@/modules/ai/indexer';

export async function POST(req: NextRequest) {
  // Basic auth check via service role key header
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { documentId } = await req.json();
  const result = await indexDocument(documentId);
  return NextResponse.json(result);
}
