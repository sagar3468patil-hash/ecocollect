-- ============================================================
-- EcoCollect — Create Demo Users (PROMPT B & Hackathon Demo)
-- Run this in Supabase Dashboard → SQL Editor → New query
-- Creates:
--   1. citizen@ecocollect.demo  / Password123!  (role: citizen)
--   2. admin@ecocollect.demo    / Password123!  (role: admin)
-- ============================================================

-- Ensure pgcrypto extension is active
create extension if not exists "pgcrypto";

-- 1. Insert or update Demo Citizen into auth.users
insert into auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'citizen@ecocollect.demo',
  crypt('Password123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Priya Citizen"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
on conflict (id) do update set
  encrypted_password = crypt('Password123!', gen_salt('bf')),
  email_confirmed_at = now(),
  raw_user_meta_data = '{"full_name":"Priya Citizen"}'::jsonb;

-- 2. Insert or update Demo Admin into auth.users
insert into auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'admin@ecocollect.demo',
  crypt('Password123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Rajesh Admin"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
on conflict (id) do update set
  encrypted_password = crypt('Password123!', gen_salt('bf')),
  email_confirmed_at = now(),
  raw_user_meta_data = '{"full_name":"Rajesh Admin"}'::jsonb;

-- 3. Upsert matching profiles with explicit roles
insert into public.profiles (id, full_name, role)
values
  ('11111111-1111-1111-1111-111111111111', 'Priya Citizen', 'citizen'),
  ('22222222-2222-2222-2222-222222222222', 'Rajesh Admin', 'admin')
on conflict (id) do update set
  role = excluded.role,
  full_name = excluded.full_name;
