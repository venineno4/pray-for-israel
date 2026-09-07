import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- In-memory sliding window rate limiter ---
// Each IP gets a list of timestamps. We allow max MAX_REQUESTS within WINDOW_MS.
const MAX_REQUESTS = 2;
const WINDOW_MS = 10_000; // 10 seconds
const ipLog = new Map<string, number[]>();

// Periodic cleanup to prevent memory leaks on long-running instances
setInterval(() => {
  const now = Date.now();
  ipLog.forEach((timestamps, ip) => {
    const valid = timestamps.filter(t => now - t < WINDOW_MS);
    if (valid.length === 0) {
      ipLog.delete(ip);
    } else {
      ipLog.set(ip, valid);
    }
  });
}, 60_000);

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipLog.get(ip) || [];
  // Keep only timestamps within the current window
  const valid = timestamps.filter(t => now - t < WINDOW_MS);
  if (valid.length >= MAX_REQUESTS) {
    ipLog.set(ip, valid);
    return true;
  }
  valid.push(now);
  ipLog.set(ip, valid);
  return false;
}

// Server-side Supabase client — lazy initialized to avoid build-time env var errors
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}
export async function POST(req: NextRequest) {
  try {
    // Extract real client IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfIp = req.headers.get('cf-connecting-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || cfIp || req.ip || 'unknown');

    // Rate limit check
    if (isRateLimited(clientIp)) {
      console.warn(`[Rate Limit] Blocked prayer submission from IP: ${clientIp}`);
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait before praying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { session_id, user_id, country, real_country } = body;

    // Basic validation
    if (!session_id || !user_id || !country) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert into Supabase — accept country exactly as sent from frontend
    const { data, error } = await getSupabase()
      .from('prayers')
      .insert([{
        session_id,
        user_id,
        country,
        real_country: real_country || '',
        is_active: true,
      }] as any);

    if (error) {
      console.error('[Pray API] Supabase insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`[Pray API] Prayer submitted from IP: ${clientIp}, country: ${country}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[Pray API] Internal error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
