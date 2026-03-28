'use client';

import { useState, useTransition } from 'react';
import { manualCheckin } from '@/modules/specialist/actions';
import { useRouter } from 'next/navigation';

export function CheckinActions({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  function handleCheckin() {
    startTransition(async () => {
      const result = await manualCheckin(sessionId, userId);
      if (result.success) {
        setStatus('success');
        router.refresh();
      } else {
        setStatus('error');
        setErrorMsg(result.error ?? 'Алдаа гарлаа');
      }
    });
  }

  if (status === 'success') {
    return (
      <span className="text-xs text-green-600 font-medium shrink-0">✅ Бүртгэгдлээ</span>
    );
  }

  if (status === 'error') {
    return (
      <span className="text-xs text-red-500 shrink-0 max-w-[120px] text-right">
        {errorMsg}
      </span>
    );
  }

  return (
    <button
      onClick={handleCheckin}
      disabled={isPending}
      className="shrink-0 text-xs bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
    >
      {isPending ? '...' : 'Бүртгэх'}
    </button>
  );
}
