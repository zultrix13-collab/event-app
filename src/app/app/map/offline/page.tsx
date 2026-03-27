export default function OfflineMapPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">📥 Offline зураг татах</h1>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-300">
        <p>Интернэтгүй үед ашиглах зорилгоор газрын зургийг урьдчилан татаж хадгалах боломжтой.</p>
      </div>

      <div className="space-y-3">
        {[
          { name: 'Арга хэмжааний газрын зураг', size: '2.4 MB', icon: '🏛️' },
          { name: 'Улаанбаатар хотын зураг', size: '8.1 MB', icon: '🌍' },
          { name: 'Нисэх буудал хүртэлх зам', size: '1.2 MB', icon: '✈️' },
        ].map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-slate-400">{item.size}</div>
              </div>
            </div>
            <button className="px-3 py-1 bg-green-500 hover:bg-green-400 text-white text-sm rounded-lg font-medium transition-colors">
              Татах
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Offline режимд зөвхөн PNG зургийн хэлбэрээр харагдана. Navigation функц хязгаарлагдмал байна.
      </p>
    </div>
  );
}
