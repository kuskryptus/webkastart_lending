create extension if not exists pgcrypto;

create table if not exists onboarding_projects (
  id uuid primary key default gen_random_uuid(),
  client_label text not null,
  token_hash char(64) not null unique,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'submitted')),
  current_step smallint not null default 1 check (current_step between 1 and 6),
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists onboarding_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references onboarding_projects(id) on delete cascade,
  object_key text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  status text not null default 'pending' check (status in ('pending', 'uploaded')),
  created_at timestamptz not null default now(),
  uploaded_at timestamptz
);

create index if not exists onboarding_assets_project_id_idx
  on onboarding_assets(project_id, created_at);

create table if not exists onboarding_rate_limits (
  rate_key char(64) not null,
  window_start timestamptz not null,
  request_count integer not null default 1,
  primary key (rate_key, window_start)
);

create index if not exists onboarding_rate_limits_window_idx
  on onboarding_rate_limits(window_start);
