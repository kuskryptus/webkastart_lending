create table if not exists shared_image_comments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references onboarding_assets(id) on delete cascade,
  author_name text not null default '' check (char_length(author_name) <= 80),
  body text not null check (char_length(body) between 1 and 2000),
  position_x double precision not null check (position_x between 0 and 1),
  position_y double precision not null check (position_y between 0 and 1),
  created_at timestamptz not null default now()
);

create index if not exists shared_image_comments_asset_created_idx
  on shared_image_comments(asset_id, created_at, id);
