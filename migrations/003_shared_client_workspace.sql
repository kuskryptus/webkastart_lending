alter table clients add column if not exists portal_token_hash char(64);

update clients as client
set portal_token_hash = project.token_hash
from onboarding_projects as project
where project.client_id = client.id and client.portal_token_hash is null;

update clients
set portal_token_hash = encode(gen_random_bytes(32), 'hex')
where portal_token_hash is null;

alter table clients alter column portal_token_hash set not null;
create unique index if not exists clients_portal_token_hash_unique
  on clients(portal_token_hash);

alter table onboarding_projects add column if not exists revision bigint not null default 1;
alter table discovery_2_forms add column if not exists revision bigint not null default 1;

insert into discovery_2_forms (client_id, token_hash)
select client.id, encode(gen_random_bytes(32), 'hex')
from clients as client
where not exists (
  select 1 from discovery_2_forms as form where form.client_id = client.id
);

create table if not exists client_workspace_sections (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  section_key text not null check (section_key in (
    'core',
    'discovery_2',
    'files',
    'creative_strategy',
    'creative_directions',
    'internal_notes'
  )),
  client_visible boolean not null default false,
  client_editable boolean not null default false,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, section_key),
  check (not client_editable or client_visible)
);

insert into client_workspace_sections (client_id, section_key, client_visible, client_editable)
select client.id, defaults.section_key, defaults.client_visible, defaults.client_editable
from clients as client
cross join (values
  ('core', true, true),
  ('discovery_2', true, true),
  ('files', true, true),
  ('creative_strategy', false, false),
  ('creative_directions', false, false),
  ('internal_notes', false, false)
) as defaults(section_key, client_visible, client_editable)
on conflict (client_id, section_key) do nothing;

alter table onboarding_assets
  add column if not exists uploaded_by text not null default 'client'
    check (uploaded_by in ('client', 'admin'));
alter table onboarding_assets
  add column if not exists client_visible boolean not null default true;
alter table onboarding_assets
  add column if not exists updated_at timestamptz not null default now();

create index if not exists onboarding_assets_client_visibility_idx
  on onboarding_assets(client_id, client_visible, created_at);
