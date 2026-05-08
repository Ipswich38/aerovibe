create table if not exists calendar_events (
  id        uuid        primary key default gen_random_uuid(),
  title     text        not null,
  type      text        not null default 'activity',  -- activity | appointment | reminder | meeting
  date      date        not null,
  time      text,        -- "HH:MM" 24h, null = all-day
  end_time  text,        -- "HH:MM" 24h, optional
  notes     text,
  location  text,
  color     text        not null default '#06b6d4',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists calendar_events_date_idx on calendar_events (date);

-- trigger to keep updated_at current
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists calendar_events_updated on calendar_events;
create trigger calendar_events_updated
  before update on calendar_events
  for each row execute function touch_updated_at();
