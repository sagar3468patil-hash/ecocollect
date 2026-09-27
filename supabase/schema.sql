-- ============================================================
-- EcoCollect — waste_requests table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- Enable uuid extension (already enabled by default in Supabase)
create extension if not exists "pgcrypto";

-- ─── Table ────────────────────────────────────────────────────
create table if not exists waste_requests (
  id              uuid            primary key default gen_random_uuid(),
  request_code    text            not null unique,   -- e.g. ECO-0001
  user_name       text            not null,
  user_email      text            not null,
  waste_category  text            not null
                  check (waste_category in (
                    'Plastic','Paper','Organic','E-Waste','Glass','Metal','Mixed Waste'
                  )),
  quantity_kg     numeric(6,2)    not null check (quantity_kg > 0),
  pickup_address  text            not null,
  pickup_date     date            not null,
  pickup_time     text            not null,          -- stored as HH:MM string
  notes           text,
  priority        text            not null default 'MEDIUM'
                  check (priority in ('LOW','MEDIUM','HIGH')),
  status          text            not null default 'SUBMITTED'
                  check (status in (
                    'SUBMITTED','REVIEWED','SCHEDULED','COLLECTED','CANCELLED'
                  )),
  created_at      timestamptz     not null default now(),
  updated_at      timestamptz     not null default now()
);

-- ─── Auto-update updated_at ────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_waste_requests_updated_at on waste_requests;
create trigger trg_waste_requests_updated_at
  before update on waste_requests
  for each row execute function set_updated_at();

-- ─── Indexes ───────────────────────────────────────────────────
create index if not exists idx_wr_status        on waste_requests (status);
create index if not exists idx_wr_category      on waste_requests (waste_category);
create index if not exists idx_wr_priority      on waste_requests (priority);
create index if not exists idx_wr_created_at    on waste_requests (created_at desc);

-- ─── Row Level Security (allow anon read/insert for MVP demo) ──
alter table waste_requests enable row level security;

-- Citizens: can read their own rows and insert new ones
create policy "anon_select" on waste_requests
  for select using (true);

create policy "anon_insert" on waste_requests
  for insert with check (true);

-- Admin update (anon key — sufficient for hackathon MVP)
create policy "anon_update" on waste_requests
  for update using (true) with check (true);
