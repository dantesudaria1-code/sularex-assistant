-- =====================================================================
-- SULAREX Solar Assistant — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL → New query).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Leads ----------
create table if not exists public.leads (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  full_name          text,
  phone              text,
  email              text,
  location           text,
  property_type      text,
  monthly_bill       numeric,
  recommended_package text,
  status             text not null default 'New',
  source             text default 'AI Assistant'
);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_phone_idx on public.leads (phone);

-- ---------- Site visits ----------
create table if not exists public.site_visits (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  full_name          text,
  contact_person     text,
  phone              text,
  address            text,
  preferred_date     text,
  preferred_time     text,
  monthly_bill       numeric,
  recommended_package text,
  status             text not null default 'Site Visit Scheduled',
  source             text default 'AI Assistant'
);
create index if not exists visits_created_idx on public.site_visits (created_at desc);

-- ---------- Row Level Security ----------
-- The app's server routes use the SERVICE ROLE key, which bypasses RLS.
-- We keep RLS ON and add NO public policies, so the anon/public key
-- cannot read or write these tables directly. This protects customer data.
alter table public.leads        enable row level security;
alter table public.site_visits  enable row level security;
