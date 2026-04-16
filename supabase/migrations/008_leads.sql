-- Lead generation: scraped prospects before they become contacts.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text not null,
  location text,
  address text,
  phone text,
  email text,
  website text,
  rating numeric(3,2),
  rating_count int,
  google_place_id text unique,
  source text not null default 'google_places',
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'dismissed')),
  notes text,
  converted_contact_id uuid references contacts(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists leads_industry_idx on leads (industry);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_place_id_idx on leads (google_place_id);
create index if not exists leads_created_idx on leads (created_at desc);

alter table leads enable row level security;
drop policy if exists "service_role full access on leads" on leads;
create policy "service_role full access on leads"
  on leads for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
