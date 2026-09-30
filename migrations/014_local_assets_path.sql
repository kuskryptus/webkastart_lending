alter table clients
  add column if not exists assets_local_path text not null default '';
