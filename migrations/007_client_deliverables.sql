alter table client_workspace_sections
  drop constraint if exists client_workspace_sections_section_key_check;

alter table client_workspace_sections
  add constraint client_workspace_sections_section_key_check
  check (section_key in (
    'core',
    'discovery_2',
    'files',
    'deliverables',
    'creative_strategy',
    'creative_directions',
    'internal_notes'
  ));

insert into client_workspace_sections (client_id, section_key, client_visible, client_editable)
select id, 'deliverables', true, false
from clients
on conflict (client_id, section_key) do nothing;

alter table onboarding_assets
  add column if not exists asset_category text not null default 'source';

alter table onboarding_assets
  drop constraint if exists onboarding_assets_asset_category_check;

alter table onboarding_assets
  add constraint onboarding_assets_asset_category_check
  check (asset_category in ('source', 'deliverable'));

create index if not exists onboarding_assets_client_category_idx
  on onboarding_assets(client_id, asset_category, created_at);
