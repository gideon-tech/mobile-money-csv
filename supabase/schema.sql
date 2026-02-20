-- ============================================================
-- MOAir — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── profiles ──────────────────────────────────────────────────────────────────
-- One row per registered user, keyed by their Clerk user ID.

create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  clerk_id    text unique not null,        -- Clerk user ID (e.g. user_2abc...)
  email       text not null,
  plan        text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast lookups by Clerk ID
create index if not exists profiles_clerk_id_idx on public.profiles (clerk_id);

-- ── conversions ───────────────────────────────────────────────────────────────
-- One row per PDF conversion. clerk_id is nullable so anonymous conversions
-- are still logged (without being tied to a user account).

create table if not exists public.conversions (
  id                uuid primary key default gen_random_uuid(),
  clerk_id          text references public.profiles (clerk_id) on delete set null,
  provider          text not null check (provider in ('MTN', 'Airtel')),
  transaction_count integer not null default 0,
  account_number    text not null default '',
  period_from       text not null default '',
  period_to         text not null default '',
  converted_at      timestamptz not null default now()
);

-- Indexes for usage queries
create index if not exists conversions_clerk_id_idx        on public.conversions (clerk_id);
create index if not exists conversions_converted_at_idx    on public.conversions (converted_at);
create index if not exists conversions_clerk_month_idx     on public.conversions (clerk_id, converted_at);

-- ── Row-Level Security ────────────────────────────────────────────────────────
-- We use the service role key server-side, so RLS is not strictly required,
-- but enabling it prevents accidental exposure if the anon key is ever used.

alter table public.profiles   enable row level security;
alter table public.conversions enable row level security;

-- Service role bypasses RLS automatically — no additional policies needed
-- for server-side access. Add user-facing policies here if you ever expose
-- these tables via the Supabase client directly in the browser.
