alter table clients
  add column if not exists onboarding_type text not null default 'landing_page';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'clients_onboarding_type_check'
  ) then
    alter table clients
      add constraint clients_onboarding_type_check
      check (onboarding_type in ('landing_page', 'meta_ads'));
  end if;
end $$;
