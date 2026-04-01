import { createAdminClient } from '@/lib/supabase/admin';
import { sendPushToTokens } from './fcm';

export type PushAudience = 'all' | 'vip' | 'general' | 'admin';

export async function sendPushNotification(params: {
  title: string;
  body: string;
  audience: PushAudience;
  data?: Record<string, string>;
}): Promise<{ sent: number; failed: number }> {
  const supabase = createAdminClient();

  let tokenQuery = supabase.from('push_tokens').select('token, user_id');

  if (params.audience !== 'all') {
    const roleMap: Record<Exclude<PushAudience, 'all'>, string> = {
      vip: 'vip',
      general: 'participant',
      admin: 'super_admin',
    };
    const { data: roleUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', roleMap[params.audience as Exclude<PushAudience, 'all'>]);

    const userIds = (roleUsers ?? []).map((r: { id: string }) => r.id);
    tokenQuery = tokenQuery.in('user_id', userIds);
  }

  const { data: tokenRows } = await tokenQuery;
  const tokens = (tokenRows ?? []).map((r: { token: string }) => r.token);

  if (tokens.length === 0) return { sent: 0, failed: 0 };

  const result = await sendPushToTokens(tokens, {
    title: params.title,
    body: params.body,
  }, params.data);

  return { sent: result.successCount, failed: result.failureCount };
}
