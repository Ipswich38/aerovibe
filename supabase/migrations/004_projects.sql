-- Projects: each belongs to a contact. Tracks the job lifecycle from lead to delivery.

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  title text not null,
  service_type text,
  status text not null default 'lead' check (
    status in ('lead', 'booked', 'shooting', 'editing', 'delivered', 'cancelled')
  ),
  shoot_date date,
  deadline date,
  amount numeric(12,2),
  location text,
  description text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists projects_contact_idx on projects (contact_id);
create index if not exists projects_status_idx on projects (status);
create index if not exists projects_shoot_date_idx on projects (shoot_date);

alter table projects enable row level security;

drop policy if exists "service_role full access on projects" on projects;
create policy "service_role full access on projects"
  on projects for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
