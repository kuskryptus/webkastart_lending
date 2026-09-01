create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table onboarding_projects add column if not exists client_id uuid;

insert into clients (id, display_name, created_at, updated_at)
select id, client_label, created_at, updated_at
from onboarding_projects
on conflict (id) do nothing;

update onboarding_projects
set client_id = id
where client_id is null;

alter table onboarding_projects alter column client_id set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'onboarding_projects_client_id_fkey'
  ) then
    alter table onboarding_projects
      add constraint onboarding_projects_client_id_fkey
      foreign key (client_id) references clients(id) on delete cascade;
  end if;
end $$;

create unique index if not exists onboarding_projects_client_id_unique
  on onboarding_projects(client_id);

alter table onboarding_assets add column if not exists client_id uuid;

update onboarding_assets as asset
set client_id = project.client_id
from onboarding_projects as project
where asset.project_id = project.id and asset.client_id is null;

alter table onboarding_assets alter column client_id set not null;

do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'onboarding_assets' and column_name = 'object_key')
    and not exists (select 1 from information_schema.columns where table_name = 'onboarding_assets' and column_name = 'storage_key') then
    alter table onboarding_assets rename column object_key to storage_key;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'onboarding_assets' and column_name = 'original_name')
    and not exists (select 1 from information_schema.columns where table_name = 'onboarding_assets' and column_name = 'original_filename') then
    alter table onboarding_assets rename column original_name to original_filename;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'onboarding_assets' and column_name = 'size_bytes')
    and not exists (select 1 from information_schema.columns where table_name = 'onboarding_assets' and column_name = 'size') then
    alter table onboarding_assets rename column size_bytes to size;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'onboarding_assets_client_id_fkey'
  ) then
    alter table onboarding_assets
      add constraint onboarding_assets_client_id_fkey
      foreign key (client_id) references clients(id) on delete cascade;
  end if;
end $$;

create index if not exists onboarding_assets_client_id_idx
  on onboarding_assets(client_id, created_at);

create table if not exists discovery_2_forms (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references clients(id) on delete cascade,
  token_hash char(64) not null unique,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'submitted')),
  current_step smallint not null default 1 check (current_step between 1 and 5),
  order_process text not null default '',
  primary_products_and_prices text not null default '',
  personalization_options text not null default '',
  customer_appreciation text not null default '',
  must_show_on_website text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  submitted_at timestamptz
);

create index if not exists discovery_2_forms_client_id_idx
  on discovery_2_forms(client_id);
