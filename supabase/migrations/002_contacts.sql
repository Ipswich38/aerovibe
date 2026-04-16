-- Shared contacts table: every person we interact with lives here once.
-- Inbox messages, clients, projects, and invoices all reference contact_id.

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  notes text,
  tags text[] default '{}',
  status text default 'lead',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists contacts_email_unique
  on contacts (lower(email))
  where email is not null;

create unique index if not exists contacts_phone_unique
  on contacts (phone)
  where phone is not null;

alter table contacts enable row level security;

drop policy if exists "service_role full access on contacts" on contacts;
create policy "service_role full access on contacts"
  on contacts for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Link inbox messages to contacts.
alter table waevpoint_messages
  add column if not exists contact_id uuid references contacts(id) on delete set null;

-- Backfill: create contacts from existing messages, then link them.
insert into contacts (name, email, phone)
select distinct on (lower(coalesce(email, phone)))
  name,
  email,
  phone
from (
  select
    name,
    case when contact like '%@%' then lower(contact) else null end as email,
    case when contact not like '%@%' then contact else null end as phone
  from waevpoint_messages
) src
on conflict do nothing;

update waevpoint_messages wm
set contact_id = c.id
from contacts c
where wm.contact_id is null
  and (
    (wm.contact like '%@%' and lower(c.email) = lower(wm.contact))
    or (wm.contact not like '%@%' and c.phone = wm.contact)
  );
