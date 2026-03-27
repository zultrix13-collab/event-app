import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  let csv = '';
  let filename = 'export.csv';

  if (type === 'orders') {
    const { data } = await supabase
      .from('orders')
      .select('id, status, total_amount, currency, payment_method, created_at, paid_at')
      .order('created_at', { ascending: false });

    filename = 'orders.csv';
    csv = 'ID,Status,Amount,Currency,Payment Method,Created At,Paid At\n';
    for (const o of data ?? []) {
      csv += `"${o.id}","${o.status}","${o.total_amount}","${o.currency}","${o.payment_method ?? ''}","${o.created_at}","${o.paid_at ?? ''}"\n`;
    }
  } else if (type === 'attendance') {
    const { data } = await supabase
      .from('attendance')
      .select('id, session_id, user_id, checked_in_at, check_in_method')
      .order('checked_in_at', { ascending: false });

    filename = 'attendance.csv';
    csv = 'ID,Session ID,User ID,Checked In At,Method\n';
    for (const a of data ?? []) {
      csv += `"${a.id}","${a.session_id}","${a.user_id}","${a.checked_in_at}","${a.check_in_method}"\n`;
    }
  } else if (type === 'steps') {
    const { data } = await supabase
      .from('step_logs')
      .select('id, user_id, steps, date, co2_saved_grams, source, created_at')
      .order('date', { ascending: false });

    filename = 'steps.csv';
    csv = 'ID,User ID,Steps,Date,CO2 Saved (g),Source,Created At\n';
    for (const s of data ?? []) {
      csv += `"${s.id}","${s.user_id}","${s.steps}","${s.date}","${s.co2_saved_grams}","${s.source}","${s.created_at}"\n`;
    }
  } else {
    return NextResponse.json({ error: 'Invalid export type. Use: orders, attendance, steps' }, { status: 400 });
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
