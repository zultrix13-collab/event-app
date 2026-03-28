import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { signOutAction } from '@/modules/auth/actions';

export const dynamic = 'force-dynamic';

export default async function SpecialistLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  const role = profile?.role ?? null;
  const allowedRoles = ['specialist', 'super_admin'];

  if (!role || !allowedRoles.includes(role)) {
    redirect('/app/home');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-amber-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/specialist/dashboard"
            className="font-bold text-base tracking-tight hover:text-amber-200 transition-colors"
          >
            👷 Мэргэжилтний самбар
          </Link>

          <nav className="flex items-center gap-3 ml-4 text-sm">
            <Link
              href="/specialist/dashboard"
              className="hover:text-amber-200 transition-colors"
            >
              Самбар
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-amber-200 hidden sm:inline">
              {profile?.full_name ?? user.email}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="bg-amber-900 hover:bg-amber-800 text-white text-xs px-3 py-1.5 rounded-md transition-colors"
              >
                Гарах
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
