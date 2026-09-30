alter table clients
  add column if not exists implementation_field_selection jsonb not null default '{}'::jsonb;
