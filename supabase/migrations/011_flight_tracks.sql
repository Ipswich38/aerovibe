-- Store per-flight GPS track points for map replay and analysis.

create table if not exists flight_track_points (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references flight_logs(id) on delete cascade,
  seq int not null,
  latitude numeric(10,6) not null,
  longitude numeric(10,6) not null,
  rel_alt numeric(8,2),
  abs_alt numeric(8,2),
  ts_ms int
);

create index if not exists ftp_flight_idx on flight_track_points (flight_id, seq);

alter table flight_track_points enable row level security;
drop policy if exists "service_role full access on flight_track_points" on flight_track_points;
create policy "service_role full access on flight_track_points"
  on flight_track_points for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
