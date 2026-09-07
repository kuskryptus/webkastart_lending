alter table onboarding_assets
  add column if not exists multipart_upload_id text;

create index if not exists onboarding_assets_pending_multipart_idx
  on onboarding_assets(client_id, created_at)
  where status = 'pending' and multipart_upload_id is not null;
