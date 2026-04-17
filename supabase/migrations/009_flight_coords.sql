-- Add geo coordinates to flight_logs so we can plot them on a map.

alter table flight_logs add column if not exists latitude numeric(10,6);
alter table flight_logs add column if not exists longitude numeric(10,6);

create index if not exists flight_logs_coords_idx on flight_logs (latitude, longitude);
