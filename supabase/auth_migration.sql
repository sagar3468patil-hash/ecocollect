-- ============================================================
-- EcoCollect — Auth Migration (PROMPT A)
-- Run this in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Create profiles table
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'citizen' check (role in ('citizen', 'admin')),
  created_at  timestamptz not null default now()
);

-- 2. Trigger function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    'citizen'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Add user_id column to existing waste_requests
alter table public.waste_requests
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_wr_user_id on public.waste_requests(user_id);

-- 4. Helper function to check if current user is an admin without recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 5. Row Level Security on profiles
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (
    auth.uid() = id or public.is_admin()
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "profiles_insert_trigger" on public.profiles;
create policy "profiles_insert_trigger"
  on public.profiles for insert
  with check (true);

-- 6. Row Level Security on waste_requests
alter table public.waste_requests enable row level security;

-- Remove old permissive demo policies
drop policy if exists "anon_select" on public.waste_requests;
drop policy if exists "anon_insert" on public.waste_requests;
drop policy if exists "anon_update" on public.waste_requests;
drop policy if exists "waste_requests_select" on public.waste_requests;
drop policy if exists "waste_requests_insert" on public.waste_requests;
drop policy if exists "waste_requests_update_admin" on public.waste_requests;
drop policy if exists "waste_requests_update_citizen_cancel" on public.waste_requests;

-- Citizens can select only their own rows (seed rows with user_id null are admin-only)
-- Admins can select all rows regardless of user_id
create policy "waste_requests_select"
  on public.waste_requests for select
  using (
    (auth.uid() = user_id and user_id is not null)
    or public.is_admin()
  );

-- Citizens can insert requests linked to their own user_id
create policy "waste_requests_insert"
  on public.waste_requests for insert
  with check (
    auth.uid() = user_id
  );

-- Admins can update all rows (status and details)
create policy "waste_requests_update_admin"
  on public.waste_requests for update
  using (public.is_admin());

-- Citizens can cancel their own pending requests if SUBMITTED
create policy "waste_requests_update_citizen_cancel"
  on public.waste_requests for update
  using (auth.uid() = user_id and status = 'SUBMITTED')
  with check (auth.uid() = user_id and status = 'CANCELLED');
