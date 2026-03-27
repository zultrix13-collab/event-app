import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center font-bold text-lg">E</div>
          <span className="text-xl font-bold tracking-tight">Event Digital Platform</span>
        </div>
        <Link
          href="/login"
          className="px-5 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-colors"
        >
          Нэвтрэх
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 gap-6">
        <span className="text-sm font-semibold tracking-widest text-green-400 uppercase">Official Digital Platform</span>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight max-w-3xl">
          Арга хэмжааны <span className="text-green-400">дижитал</span> туршлага
        </h1>
        <p className="text-lg text-slate-300 max-w-xl">
          Хөтөлбөр, бүртгэл, үйлчилгээ, газрын зураг — бүгд нэг дор. Оролцогч, зохион байгуулагч, VIP зочдод зориулсан нэгдсэн платформ.
        </p>
        <div className="flex gap-4 mt-4 flex-wrap justify-center">
          <Link
            href="/login"
            className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-400 font-bold text-lg transition-colors shadow-lg shadow-green-900/40"
          >
            Нэвтрэх
          </Link>
          <Link
            href="/apply-vip"
            className="px-8 py-3 rounded-xl border border-white/20 hover:bg-white/10 font-semibold text-lg transition-colors"
          >
            VIP бүртгэл
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-24 max-w-5xl mx-auto">
        {[
          { icon: '📅', title: 'Хөтөлбөр', desc: 'Интерактив календарь, суудал захиалга, хувийн agenda' },
          { icon: '🗺️', title: 'Газрын зураг', desc: 'Дотоод болон гадаад навигаци, offline дэмжлэг' },
          { icon: '🤖', title: 'AI Туслах', desc: 'Монгол/Англи хэлээр хариулах RAG chatbot' },
          { icon: '💳', title: 'Төлбөр', desc: 'QPay, SocialPay, дижитал wallet' },
          { icon: '🔔', title: 'Мэдэгдэл', desc: 'Push, SMS, яаралтай broadcast' },
          { icon: '🪪', title: 'Дижитал үнэмлэх', desc: 'QR + NFC, offline баталгаажуулалт' },
        ].map((f) => (
          <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-lg mb-1">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-500 text-sm border-t border-white/10">
        © 2026 Event Digital Platform. All rights reserved.
      </footer>
    </main>
  );
}
