import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

const CATEGORY_LABELS: Record<string, string> = {
  programme: 'Хөтөлбөр',
  faq: 'FAQ',
  venue: 'Байршил',
  service: 'Үйлчилгээ',
  general: 'Ерөнхий',
  emergency: 'Яаралтай',
};

const CATEGORY_COLORS: Record<string, string> = {
  programme: 'bg-blue-100 text-blue-800',
  faq: 'bg-yellow-100 text-yellow-800',
  venue: 'bg-purple-100 text-purple-800',
  service: 'bg-orange-100 text-orange-800',
  general: 'bg-slate-100 text-slate-800',
  emergency: 'bg-red-100 text-red-800',
};

type DocWithChunks = {
  id: string;
  title: string;
  title_en: string | null;
  category: string | null;
  is_active: boolean;
  updated_at: string;
  chunkCount: number;
};

async function getDocuments(): Promise<DocWithChunks[]> {
  const supabase = getSupabaseAdminClient();
  const { data: docs } = await supabase
    .from('kb_documents')
    .select('id, title, title_en, category, is_active, updated_at')
    .order('created_at', { ascending: false });

  if (!docs) return [];

  // Get chunk counts
  const { data: chunks } = await supabase
    .from('kb_chunks')
    .select('document_id');

  const chunkMap: Record<string, number> = {};
  for (const c of chunks ?? []) {
    chunkMap[c.document_id] = (chunkMap[c.document_id] ?? 0) + 1;
  }

  return docs.map(d => ({ ...d, chunkCount: chunkMap[d.id] ?? 0 }));
}

export default async function AdminAIPage() {
  const documents = await getDocuments();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Мэдлэгийн Сан</h1>
          <p className="text-slate-500 text-sm mt-1">RAG chatbot-ын баримт бичгүүд</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/ai/handoffs"
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            🔔 Handoff жагсаалт
          </Link>
          <Link
            href="/admin/ai/new"
            className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            + Шинэ баримт нэмэх
          </Link>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-4">📄</div>
          <p>Баримт бичиг байхгүй байна.</p>
          <Link href="/admin/ai/new" className="mt-4 inline-block text-green-500 underline">
            Анхны баримтаа нэмэх
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Гарчиг</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Ангилал</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Chunk</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Идэвхтэй</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Огноо</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{doc.title}</div>
                    {doc.title_en && (
                      <div className="text-slate-400 text-xs">{doc.title_en}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[doc.category ?? 'general'] ?? 'bg-slate-100 text-slate-800'}`}>
                      {CATEGORY_LABELS[doc.category ?? 'general'] ?? doc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-slate-600">{doc.chunkCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={doc.is_active ? 'text-green-600' : 'text-red-400'}>
                      {doc.is_active ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(doc.updated_at).toLocaleDateString('mn-MN')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/ai/reindex?id=${doc.id}`}
                      className="px-3 py-1 text-xs border border-slate-200 rounded hover:bg-slate-100 transition-colors"
                    >
                      Re-index
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
