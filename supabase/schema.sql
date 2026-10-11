-- ─────────────────────────────────────────────────────────────────────────────
--  Birthday wishes table
--  Run this once in Supabase → SQL Editor → "New query" → paste → Run.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.wishes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null check (char_length(name) between 1 and 60),
  relationship  text check (relationship is null or char_length(relationship) <= 60),
  message       text not null check (char_length(message) between 2 and 1000),
  memory        text check (memory is null or char_length(memory) <= 300),
  -- false = hidden until you approve it in the Table Editor
  approved      boolean not null default true,
  -- salted SHA-256 of the sender's IP, used only for rate limiting
  ip_hash       text
);

create index if not exists wishes_public_idx on public.wishes (created_at desc) where approved;
create index if not exists wishes_rate_idx   on public.wishes (ip_hash, created_at desc);

-- ── Security ────────────────────────────────────────────────────────────────
-- Row Level Security ON with NO policies = the public "anon"/"publishable"
-- key can neither read nor write this table. All access goes through the
-- website's server route, which validates input, rate-limits, and only ever
-- returns the public columns (never ip_hash).
alter table public.wishes enable row level security;

revoke all on table public.wishes from anon, authenticated;
