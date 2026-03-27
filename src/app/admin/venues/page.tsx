import { createClient } from '@/lib/supabase/server';
import { createVenue, deleteVenue } from '@/modules/programme/actions';
import { revalidatePath } from 'next/cache';

async function handleCreate(formData: FormData) {
  'use server';
  await createVenue({
    name: formData.get('name') as string,
    name_en: (formData.get('name_en') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    capacity: parseInt(formData.get('capacity') as string) || 0,
    location: (formData.get('location') as string) || undefined,
    floor: formData.get('floor') ? parseInt(formData.get('floor') as string) : undefined,
  });
  revalidatePath('/admin/venues');
}

export default async function AdminVenuesPage() {
  const supabase = await createClient();
  const { data: venues } = await supabase
    .from('venues')
    .select('*')
    .order('name');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Заалнууд</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create form */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Шинэ заал нэмэх</h2>
          <form action={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Нэр (МН) *</label>
              <input name="name" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name (EN)</label>
              <input name="name_en" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Байршил</label>
              <input name="location" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Давхар</label>
              <input name="floor" type="number" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Хүчин чадал</label>
              <input name="capacity" type="number" min="0" defaultValue="0" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Тайлбар</label>
              <textarea name="description" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
              Нэмэх
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          {!venues || venues.length === 0 ? (
            <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-gray-500">
              <p className="text-3xl mb-2">🏛️</p>
              <p>Заал байхгүй байна</p>
            </div>
          ) : (
            <div className="space-y-3">
              {venues.map((venue) => (
                <div key={venue.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">
                    🏛️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{venue.name}</p>
                    {venue.name_en && <p className="text-xs text-gray-400">{venue.name_en}</p>}
                    <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                      {venue.capacity > 0 && <span>👥 {venue.capacity} хүн</span>}
                      {venue.floor != null && <span>🏢 {venue.floor}-р давхар</span>}
                      {venue.location && <span>📍 {venue.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${venue.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {venue.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                    </span>
                    <form action={async () => {
                      'use server';
                      await deleteVenue(venue.id);
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
