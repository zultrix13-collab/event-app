'use client';
import { useState } from 'react';
import { logSteps } from '@/modules/green/actions';

export default function StepLogger() {
  const [steps, setSteps] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; co2Saved?: number; error?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const stepCount = parseInt(steps, 10);
    if (isNaN(stepCount) || stepCount < 1) return;

    setLoading(true);
    setResult(null);
    const res = await logSteps(stepCount);
    setResult(res);
    setLoading(false);
    if (res.success) setSteps('');
  }

  const previewCo2 = steps ? (parseInt(steps, 10) * 0.08).toFixed(0) : null;

  return (
    <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">🚶 Алхам бүртгэх</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="number"
            min="1"
            max="100000"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="Алхамын тоо оруулна уу..."
            className="w-full border rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {previewCo2 && parseInt(steps, 10) > 0 && (
            <p className="text-xs text-green-600 mt-1 ml-1">
              ≈ {parseInt(steps, 10).toLocaleString()} алхам = {previewCo2}г CO₂ хэмнэлт 🌱
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !steps || parseInt(steps, 10) < 1}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Хадгалж байна...' : 'Алхам бүртгэх'}
        </button>
      </form>

      {result?.success && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
          ✅ Бүртгэгдлээ! {parseInt(steps || '0', 10).toLocaleString()} алхам = {result.co2Saved?.toFixed(0)}г CO₂ хэмнэлт! 🌱
        </div>
      )}
      {result?.error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          ❌ {result.error}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400">
        📱 Flutter апп дээр HealthKit / Health Connect-ээс автоматаар sync хийгдэнэ
      </p>
    </div>
  );
}
