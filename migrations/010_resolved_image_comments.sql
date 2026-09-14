alter table shared_image_comments
  add column if not exists resolved_at timestamptz;
