alter table public.profiles
  add column if not exists blocks jsonb not null default '[]'::jsonb;

alter table public.profiles
  add constraint profiles_blocks_array
  check (
    jsonb_typeof(blocks) = 'array'
    and jsonb_array_length(blocks) <= 24
  );

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
begin
  requested_username := pg_catalog.lower(coalesce(new.raw_user_meta_data ->> 'username', ''));

  if requested_username !~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'
    or requested_username = any (array['login', 'signup', 'dashboard', 'auth', 'api', 'settings', '_next']) then
    raise exception 'Invalid username' using errcode = '23514';
  end if;

  insert into public.profiles (id, username, display_name, blocks)
  values (
    new.id,
    requested_username,
    requested_username,
    '[
      {"id":"intro","type":"intro","title":"A little intro","content":"Tell people a bit about yourself.","color":"lime","size":"large"},
      {"id":"spotify","type":"spotify","title":"Currently into","content":"Add a Spotify link","color":"peach","size":"large"},
      {"id":"github","type":"github","title":"GitHub","content":"Add your GitHub link","color":"lavender","size":"small"},
      {"id":"project","type":"project","title":"Selected work","content":"Show something you made","color":"mint","size":"large"},
      {"id":"socials","type":"social","title":"Find me","content":"Add your social links","color":"lilac","size":"small"}
    ]'::jsonb
  );

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
