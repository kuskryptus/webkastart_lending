create table if not exists client_portal_links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  token_hash char(64) not null unique,
  encrypted_token text,
  created_at timestamptz not null default now()
);

insert into client_portal_links (client_id, token_hash, encrypted_token, created_at)
select client.id, client.portal_token_hash, null, client.created_at
from clients as client
where not exists (
  select 1 from client_portal_links as link
  where link.token_hash = client.portal_token_hash
);

create index if not exists client_portal_links_client_id_idx
  on client_portal_links(client_id, created_at desc);
