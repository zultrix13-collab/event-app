import { createClient } from '@/lib/supabase/server';
import { createSpeaker, deleteSpeaker } from '@/modules/programme/actions';
import { revalidatePath } from 'next/cache';

async function handleCreate(formData: FormData) {
  'use server';
  await createSpeaker({
    full_name: formData.get('full_name') as string,
    full_name_en: (formData.get('full_name_en') as string) || undefined,
    title: (formData.get('title') as string) || undefined,
    title_en: (formData.get('title_en') as string) || undefined,
    organization: (formData.get('organization') as string) || undefined,
    organization_en: (formData.get('organization_en') as string) || undefined,
    bio: (formData.get('bio') as string) || undefined,
    avatar_url: (formData.get('avatar_url') as string) || undefined,
    country: (formData.get('country') as string) || undefined,
  });
  revalidatePath('/admin/speakers');
}

export default async function AdminSpeakersPage() {
  const supabase = await createClient();
  const { data: speakers } = await supabase
    .from('speakers')
    .select('*')
    .order('full_name');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Илтгэгчид</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create form */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Шинэ илтгэгч нэмэх</h2>
          <form action={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Нэр (МН) *</label>
              <input name="full_name" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name (EN)</label>
              <input name="full_name_en" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Албан тушаал</label>
              <input name="title" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title (EN)</label>
              <input name="title_en" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Байгууллага</label>
              <input name="organization" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Organization (EN)</label>
              <input name="organization_en" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Улс</label>
              <input name="country" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Avatar URL</label>
              <input name="avatar_url" type="url" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Намтар</label>
              <textarea name="bio" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
              Нэмэх
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          {!speakers || speakers.length === 0 ? (
            <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-gray-500">
              <p className="text-3xl mb-2">🎤</p>
              <p>Илтгэгч байхгүй байна</p>
            </div>
          ) : (
            <div className="space-y-3">
              {speakers.map((speaker) => (
                <div key={speaker.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0">
                    {speaker.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={speaker.avatar_url} alt={speaker.full_name} className="w-full h-full object-cover" />
                    ) : (
                      speaker.full_name[0]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{speaker.full_name}</p>
                    {speaker.title && <p className="text-xs text-gray-500">{speaker.title}</p>}
                    {speaker.organization && <p className="text-xs text-gray-400">{speaker.organization}</p>}
                    {speaker.country && <p className="text-xs text-gray-400">🌍 {speaker.country}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${speaker.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {speaker.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                    </span>
                    <form action={async () => {
                      'use server';
                      await deleteSpeaker(speaker.id);
                    }}>
                      <button type="submit" className="text-xs text-red-600 hover:underline">
                        Устгах
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
