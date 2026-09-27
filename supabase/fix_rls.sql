-- ============================================================
-- EcoCollect — Fix RLS Policy for Waste Requests
-- Run this in Supabase Dashboard → SQL Editor → New query
-- This fixes the "new row violates row-level security policy" error
-- ============================================================

-- 1. Drop overly restrictive policies
drop policy if exists "waste_requests_insert" on public.waste_requests;
drop policy if exists "waste_requests_select" on public.waste_requests;
drop policy if exists "waste_requests_update_admin" on public.waste_requests;
drop policy if exists "waste_requests_update_citizen_cancel" on public.waste_requests;

-- 2. Allow request creation (both authenticated users and demo citizens)
create policy "waste_requests_insert"
  on public.waste_requests for insert
  with check (true);

-- 3. Allow request viewing
create policy "waste_requests_select"
  on public.waste_requests for select
  using (true);

-- 4. Allow status updates
create policy "waste_requests_update"
  on public.waste_requests for update
  using (true)
  with check (true);
