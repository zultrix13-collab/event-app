'use server';

import { createClient } from '@/lib/supabase/server';
import { generateDigitalIdPayload } from '@/modules/auth/digital-id';
import { getRoleRedirect } from '@/modules/auth/rbac';
import type { VipApplication } from '@/modules/auth/types';
import { revalidatePath } from 'next/cache';

// Check OTP rate limit via RPC (check_otp_rate_limit)
async function checkOtpRateLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string
): Promise<{ blocked: boolean; blockedUntil?: Date; minutesLeft?: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('check_otp_rate_limit', { p_email: email });

  if (error) {
    // RPC unavailable — fail open (allow the request)
    console.warn('[checkOtpRateLimit] RPC error:', error.message);
    return { blocked: false };
  }

  const result = data as { allowed: boolean; attempts_left: number; blocked_until: string | null };

  if (!result.allowed && result.blocked_until) {
    const blockedUntil = new Date(result.blocked_until);
    const minutesLeft = Math.ceil((blockedUntil.getTime() - Date.now()) / 60_000);
    return { blocked: true, blockedUntil, minutesLeft };
  }

  return { blocked: false };
}

export async function signInWithGoogle() {
  try {
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) return { success: false, error: error.message };
    return { success: true, url: data.url };
  } catch {
    return { success: false, error: 'Google нэвтрэлт амжилтгүй боллоо.' };
  }
}

export async function signInWithOTP(email: string) {
  try {
    const supabase = await createClient();

    const { blocked, minutesLeft } = await checkOtpRateLimit(supabase, email);
    if (blocked) {
      return {
        success: false,
        error: `Хэт олон оролдлого. ${minutesLeft ?? 10} минутын дараа дахин оролдоно уу.`,
      };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch {
    return { success: false, error: 'Алдаа гарлаа. Дахин оролдоно уу.' };
  }
}

export async function verifyOTP(email: string, token: string) {
  try {
    const supabase = await createClient();

    // Rate-limit check before attempting verify
    const { blocked, minutesLeft } = await checkOtpRateLimit(supabase, email);
    if (blocked) {
      return {
        success: false,
        error: `Хэт олон оролдлого. ${minutesLeft ?? 10} минутын дараа дахин оролдоно уу.`,
      };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      // Increment attempt count
      await supabase.rpc('increment_otp_attempts', { p_email: email });
      return { success: false, error: 'Буруу код. Дахин оролдоно уу.' };
    }

    if (!data.user) return { success: false, error: 'Хэрэглэгч олдсонгүй.' };

    // Reset OTP attempts
    await supabase.from('otp_attempts').delete().eq('email', email);

    // Get or create profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('role, is_approved')
      .eq('id', data.user.id)
      .single();

    let role: string;
    let isApproved: boolean;

    if (!existingProfile) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email ?? email,
        role: 'participant',
        is_approved: true, // participants auto-approved
        last_login_at: new Date().toISOString(),
      });
      role = 'participant';
      isApproved = true;
    } else {
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);
      role = existingProfile.role ?? 'participant';
      isApproved = existingProfile.is_approved ?? false;
    }

    if (!isApproved) {
      return { success: true, redirectUrl: '/pending-approval' };
    }

    return {
      success: true,
      role,
      redirectUrl: getRoleRedirect(role),
    };
  } catch {
    return { success: false, error: 'Алдаа гарлаа.' };
  }
}

export async function applyForVIP(formData: VipApplication) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('vip_applications')
      .insert({
        user_id: user?.id ?? null,
        full_name: formData.full_name,
        email: formData.email,
        organization: formData.organization,
        position: formData.position,
        reason: formData.reason,
      })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, applicationId: data.id };
  } catch {
    return { success: false, error: 'Алдаа гарлаа.' };
  }
}

export async function approveUser(userId: string, approve: boolean, role?: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
      .from('profiles')
      .update({
        is_approved: approve,
        approved_by: approve ? user.id : null,
        approved_at: approve ? new Date().toISOString() : null,
        ...(approve && role ? { role } : {}),
      })
      .eq('id', userId);

    if (error) return { success: false, error: error.message };

    // Generate digital ID for VIP
    if (approve && role === 'vip') {
      const { payload, signature, expiresAt } = generateDigitalIdPayload(userId, 'vip');
      await supabase.from('digital_ids').upsert({
        user_id: userId,
        qr_payload: payload,
        hmac_signature: signature,
        expires_at: expiresAt.toISOString(),
      });
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch {
    return { success: false, error: 'Алдаа гарлаа.' };
  }
}

// Admin: update user role
export async function updateUserRole(userId: string, role: string) {
  try {
    const { getSupabaseAdminClient } = await import('@/lib/supabase/admin');
    const admin = getSupabaseAdminClient();
    const { error } = await admin
      .from('profiles')
      .update({ role } as Record<string, unknown>)
      .eq('id', userId);
    if (error) return { success: false, error: error.message };
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath('/admin/users');
    return { success: true };
  } catch {
    return { success: false, error: 'Алдаа гарлаа.' };
  }
}

// Admin: update user status (is_approved, is_active)
export async function updateUserStatus(userId: string, params: { is_approved?: boolean; is_active?: boolean }) {
  try {
    const { getSupabaseAdminClient } = await import('@/lib/supabase/admin');
    const admin = getSupabaseAdminClient();
    const { error } = await admin
      .from('profiles')
      .update(params as Record<string, unknown>)
      .eq('id', userId);
    if (error) return { success: false, error: error.message };
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath('/admin/users');
    return { success: true };
  } catch {
    return { success: false, error: 'Алдаа гарлаа.' };
  }
}
