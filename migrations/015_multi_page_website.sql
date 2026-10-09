alter table clients
  drop constraint if exists clients_onboarding_type_check;

alter table clients
  add constraint clients_onboarding_type_check
  check (onboarding_type in ('landing_page', 'multi_page_website', 'meta_ads'));
