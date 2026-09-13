create table if not exists consultation_bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 160),
  phone text not null default '' check (char_length(phone) <= 60),
  company text not null default '' check (char_length(company) <= 160),
  note text not null default '' check (char_length(note) <= 2000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  source text not null default 'website' check (source in ('website', 'team_go')),
  external_id text unique check (external_id is null or char_length(external_id) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create unique index if not exists consultation_bookings_confirmed_start_idx
  on consultation_bookings(starts_at)
  where status = 'confirmed';

create index if not exists consultation_bookings_range_idx
  on consultation_bookings(starts_at, ends_at)
  where status = 'confirmed';

create index if not exists consultation_bookings_updated_idx
  on consultation_bookings(updated_at, id);
