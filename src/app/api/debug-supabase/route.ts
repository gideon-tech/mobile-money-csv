import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const keyPresent = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 1. Raw fetch test — bypasses Supabase client entirely
  let rawFetch: object = {};
  try {
    const res = await fetch(`${url}/rest/v1/`, { method: 'GET' });
    rawFetch = { ok: true, status: res.status };
  } catch (e: unknown) {
    const err = e as Error & { cause?: unknown };
    rawFetch = {
      ok: false,
      message: err.message,
      cause: String(err.cause),
      code: (err.cause as NodeJS.ErrnoException)?.code,
    };
  }

  // 2. Supabase client test
  let supabaseTest: object = {};
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    supabaseTest = { ok: !error, error: error?.message ?? null, data };
  } catch (e: unknown) {
    const err = e as Error & { cause?: unknown };
    supabaseTest = {
      ok: false,
      message: err.message,
      cause: String(err.cause),
    };
  }

  return NextResponse.json({ url, keyPresent, rawFetch, supabaseTest });
}
