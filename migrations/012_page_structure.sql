alter table client_workspace_sections
  drop constraint if exists client_workspace_sections_section_key_check;

alter table client_workspace_sections
  add constraint client_workspace_sections_section_key_check
  check (section_key in (
    'core',
    'discovery_2',
    'files',
    'page_structure',
    'deliverables',
    'creative_strategy',
    'creative_directions',
    'internal_notes'
  ));

alter table client_workspace_sections
  add column if not exists revision bigint not null default 1;

insert into client_workspace_sections (
  client_id,
  section_key,
  client_visible,
  client_editable,
  content
)
select
  id,
  'page_structure',
  onboarding_type = 'landing_page',
  onboarding_type = 'landing_page',
  '{"sections":[]}'
from clients
on conflict (client_id, section_key) do nothing;
