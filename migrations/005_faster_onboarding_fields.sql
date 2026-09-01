alter table discovery_2_forms
  add column if not exists order_methods jsonb not null default '[]'::jsonb,
  add column if not exists order_methods_other text not null default '',
  add column if not exists products_and_prices jsonb not null default '[]'::jsonb,
  add column if not exists personalization_choices jsonb not null default '[]'::jsonb,
  add column if not exists customer_appreciation_choices jsonb not null default '[]'::jsonb,
  add column if not exists customer_quote text not null default '',
  add column if not exists frequent_questions jsonb not null default '[]'::jsonb,
  add column if not exists frequent_questions_other text not null default '',
  add column if not exists must_show_choices jsonb not null default '[]'::jsonb;

alter table discovery_2_forms
  drop constraint if exists discovery_2_forms_current_step_check;

alter table discovery_2_forms
  add constraint discovery_2_forms_current_step_check
  check (current_step between 1 and 6);
