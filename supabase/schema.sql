-- FreshCheck: ejecutar en Supabase → SQL Editor → Run

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'Usuario',
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  produce_name text not null,
  produce_type text not null check (produce_type in ('Fruit', 'Vegetable')),
  condition text not null check (condition in ('Healthy', 'Damaged', 'Overripe')),
  fruit_type_confidence smallint not null,
  condition_confidence smallint not null,
  latency_ms integer not null,
  resolution text,
  file_size text,
  created_at timestamptz not null default now()
);

create index if not exists analyses_user_created_idx
  on public.analyses (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.analyses enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "analyses_select_own"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "analyses_insert_own"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "analyses_delete_own"
  on public.analyses for delete
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
