-- Drones register + CAAP-compliant flight log.

create table if not exists drones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  model text,
  serial_number text,
  caap_registration text,
  purchased_at date,
  status text not null default 'active' check (status in ('active', 'maintenance', 'retired')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table drones enable row level security;
drop policy if exists "service_role full access on drones" on drones;
create policy "service_role full access on drones"
  on drones for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create table if not exists flight_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  pilot_name text not null,
  drone_id uuid references drones(id) on delete set null,
  drone_name text,
  location text not null,
  takeoff_time time,
  landing_time time,
  duration_minutes int,
  purpose text not null default 'training' check (purpose in ('training', 'commercial', 'test', 'recreational', 'other')),
  weather text,
  incidents text,
  project_id uuid references projects(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists flight_logs_date_idx on flight_logs (date desc);
create index if not exists flight_logs_drone_idx on flight_logs (drone_id);
create index if not exists flight_logs_project_idx on flight_logs (project_id);

alter table flight_logs enable row level security;
drop policy if exists "service_role full access on flight_logs" on flight_logs;
create policy "service_role full access on flight_logs"
  on flight_logs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
