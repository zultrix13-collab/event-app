export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Тусламж &amp; AI Туслах</h1>

      <section className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-2">🤖 AI Туслах</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
          Монгол болон Англи хэлээр асуулт тавьж болно. Баруун доод буланд байгаа товчийг дарна уу.
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            'Хөтөлбөр хаана харах вэ?',
            'Бүртгэл яаж хийх вэ?',
            'Where is the venue?',
            'How to book a seat?',
          ].map(q => (
            <div
              key={q}
              className="bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-green-50 border border-slate-200 dark:border-slate-700"
            >
              &quot;{q}&quot;
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-bold text-lg mb-3">🚨 Яаралтай холбоо</h2>
        <div className="space-y-2">
          {[
            { label: 'Эмнэлгийн тусламж', phone: '103', icon: '🏥' },
            { label: 'Аюулгүй байдал', phone: '102', icon: '🔒' },
            { label: 'Арга хэмжааний туслах', phone: '+976 7700-0000', icon: '📞' },
          ].map(c => (
            <a
              key={c.label}
              href={`tel:${c.phone}`}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4 hover:bg-red-100 transition-colors"
            >
              <span className="text-2xl">{c.icon}</span>
              <div>
                <div className="font-semibold">{c.label}</div>
                <div className="text-red-600 font-mono">{c.phone}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-bold text-lg mb-3">❓ Түгээмэл асуултууд</h2>
        <div className="space-y-3">
          {[
            {
              q: 'Апп-д хэрхэн нэвтрэх вэ?',
              a: 'И-мэйл хаягаараа нэг удаагийн код авна уу. VIP зочид тусдаа бүртгэлтэй.',
            },
            {
              q: 'Суудал захиалах боломжтой юу?',
              a: 'Тийм. Programme хэсгийн арга хэмжааг сонгоод "Бүртгүүлэх" товч дарна уу.',
            },
            {
              q: 'Wallet-ийг яаж цэнэглэх вэ?',
              a: 'QPay эсвэл SocialPay ашиглан Profile → Wallet хэсгээс цэнэглэнэ.',
            },
            {
              q: 'Газрын зургийг хаанаас харах вэ?',
              a: 'Map хэсгийг нээгээд дотоод зургийг offline горимд ч харах боломжтой.',
            },
          ].map(item => (
            <details key={item.q} className="border border-slate-200 dark:border-slate-700 rounded-xl">
              <summary className="px-4 py-3 cursor-pointer font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                {item.q}
              </summary>
              <p className="px-4 pb-3 text-sm text-slate-600 dark:text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
