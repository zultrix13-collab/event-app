'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Badge, LeaderboardEntry, UserStepStats } from './types';

// CO2 calculation: 1 step ≈ 0.08g CO2 saved vs car
const CO2_PER_STEP_GRAMS = 0.08;

export async function logSteps(
  steps: number,
  date?: string
): Promise<{ success: boolean; error?: string; co2Saved?: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Нэвтрэх шаардлагатай' };

  if (steps < 0 || steps > 100000) {
    return { success: false, error: 'Алхамын тоо буруу байна (0–100,000)' };
  }

  const logDate = date ?? new Date().toISOString().split('T')[0];
  const co2Saved = Math.round(steps * CO2_PER_STEP_GRAMS * 100) / 100;

  const { error } = await supabase.from('step_logs').upsert(
    {
      user_id: user.id,
      steps,
      date: logDate,
      co2_saved_grams: co2Saved,
      source: 'manual',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,date' }
  );

  if (error) return { success: false, error: 'Алхам хадгалахад алдаа гарлаа' };

  // Get total steps for badge check
  const { data: totals } = await supabase
    .from('step_logs')
    .select('steps, co2_saved_grams')
    .eq('user_id', user.id);

  const totalSteps = totals?.reduce((sum, r) => sum + (r.steps ?? 0), 0) ?? 0;
  const totalCo2 = totals?.reduce((sum, r) => sum + Number(r.co2_saved_grams ?? 0), 0) ?? 0;

  await checkAndAwardBadges(user.id, totalSteps, totalCo2);

  revalidatePath('/app/green');
  return { success: true, co2Saved };
}

export async function getUserStepStats(): Promise<UserStepStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { todaySteps: 0, totalSteps: 0, totalCo2Grams: 0, badges: [] };
  }

  const today = new Date().toISOString().split('T')[0];

  const [{ data: allLogs }, { data: todayLog }, { data: earnedBadges }] = await Promise.all([
    supabase.from('step_logs').select('steps, co2_saved_grams').eq('user_id', user.id),
    supabase.from('step_logs').select('steps').eq('user_id', user.id).eq('date', today).single(),
    supabase
      .from('user_badges')
      .select('badge_id, earned_at, badges(*)')
      .eq('user_id', user.id),
  ]);

  const totalSteps = allLogs?.reduce((sum, r) => sum + (r.steps ?? 0), 0) ?? 0;
  const totalCo2Grams = allLogs?.reduce((sum, r) => sum + Number(r.co2_saved_grams ?? 0), 0) ?? 0;
  const todaySteps = todayLog?.steps ?? 0;

  const badges: Badge[] = (earnedBadges ?? [])
    .map((ub) => {
      const b = ub.badges as unknown as Badge | null;
      return b ?? null;
    })
    .filter((b): b is Badge => b !== null);

  // Get rank from leaderboard view
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('user_id')
    .order('total_steps', { ascending: false });

  const rank =
    leaderboard ? leaderboard.findIndex((r) => r.user_id === user.id) + 1 : undefined;

  return {
    todaySteps,
    totalSteps,
    totalCo2Grams,
    badges,
    rank: rank && rank > 0 ? rank : undefined,
  };
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('leaderboard')
    .select('user_id, full_name, country, organization, total_steps, total_co2_saved, badge_count')
    .order('total_steps', { ascending: false })
    .limit(limit);

  return (data ?? []) as LeaderboardEntry[];
}

export async function checkAndAwardBadges(
  userId: string,
  totalSteps: number,
  totalCo2: number
): Promise<Badge[]> {
  const supabase = await createClient();

  // Get all badges
  const { data: allBadges } = await supabase.from('badges').select('*');
  if (!allBadges?.length) return [];

  // Get already earned badge IDs
  const { data: earned } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  const earnedIds = new Set((earned ?? []).map((e) => e.badge_id));

  const newBadges: Badge[] = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;

    let qualifies = false;
    if (badge.badge_type === 'steps' && totalSteps >= badge.requirement_steps) {
      qualifies = true;
    } else if (badge.badge_type === 'co2') {
      // CO2 badges: check grams threshold based on name
      if (badge.name === 'Ногоон тэмцэгч' && totalCo2 >= 500) qualifies = true;
      if (badge.name === 'Байгаль хамгаалагч' && totalCo2 >= 1000) qualifies = true;
    }

    if (qualifies) {
      const { error } = await supabase
        .from('user_badges')
        .insert({ user_id: userId, badge_id: badge.id })
        .select()
        .single();

      if (!error) {
        newBadges.push(badge as Badge);
      }
    }
  }

  return newBadges;
}

export async function deleteUserStepData(userId: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.from('step_logs').delete().eq('user_id', userId);
  if (error) return { success: false };
  revalidatePath('/app/green');
  return { success: true };
}

// Submit a complaint/feedback
export async function submitComplaint(params: {
  subject: string;
  description: string;
  category: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('complaints').insert({
    user_id: user?.id ?? null,
    subject: params.subject,
    description: params.description,
    category: params.category as 'general' | 'service' | 'technical' | 'safety' | 'other',
  });

  if (error) return { success: false, error: 'Илгээхэд алдаа гарлаа' };
  return { success: true };
}

// Admin: update complaint status
export async function updateComplaintStatus(
  complaintId: string,
  status: string,
  adminNotes?: string,
  assignedTo?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (adminNotes !== undefined) update.admin_notes = adminNotes;
  if (assignedTo !== undefined) update.assigned_to = assignedTo;
  if (status === 'resolved') update.resolved_at = new Date().toISOString();

  const { error } = await supabase.from('complaints').update(update).eq('id', complaintId);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/complaints');
  return { success: true };
}
