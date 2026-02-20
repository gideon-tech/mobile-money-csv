import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client using the service role key.
// Never expose this client or the service role key to the browser.
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Plan = 'free' | 'pro' | 'enterprise';

export interface Profile {
  id: string;
  clerk_id: string;
  email: string;
  plan: Plan;
  created_at: string;
  updated_at: string;
}

export interface Conversion {
  id: string;
  clerk_id: string | null;
  provider: 'MTN' | 'Airtel';
  transaction_count: number;
  account_number: string;
  period_from: string;
  period_to: string;
  converted_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Upsert a user profile row (creates on first login, keeps plan on subsequent calls). */
export async function upsertProfile(clerkId: string, email: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { clerk_id: clerkId, email, updated_at: new Date().toISOString() },
      { onConflict: 'clerk_id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    console.error('upsertProfile error:', error.message);
    return null;
  }
  return data as Profile;
}

/** Return how many conversions this user has done in the current calendar month. */
export async function getMonthlyConversionCount(clerkId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('conversions')
    .select('*', { count: 'exact', head: true })
    .eq('clerk_id', clerkId)
    .gte('converted_at', startOfMonth.toISOString());

  if (error) {
    console.error('getMonthlyConversionCount error:', error.message);
    return 0;
  }
  return count ?? 0;
}

/** Log a completed conversion. */
export async function logConversion(data: {
  clerkId: string | null;
  provider: 'MTN' | 'Airtel';
  transactionCount: number;
  accountNumber: string;
  periodFrom: string;
  periodTo: string;
}): Promise<void> {
  const { error } = await supabase.from('conversions').insert({
    clerk_id: data.clerkId,
    provider: data.provider,
    transaction_count: data.transactionCount,
    account_number: data.accountNumber,
    period_from: data.periodFrom,
    period_to: data.periodTo,
  });

  if (error) {
    console.error('logConversion error:', error.message);
  }
}

/** Return a user's plan. Defaults to 'free' if no profile found. */
export async function getUserPlan(clerkId: string): Promise<Plan> {
  const { data, error } = await supabase
    .from('profiles')
    .select('plan')
    .eq('clerk_id', clerkId)
    .single();

  if (error || !data) return 'free';
  return (data.plan as Plan) ?? 'free';
}
