-- Invoices + quotes. Single table, kind discriminator. Items stored as JSONB.

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'invoice' check (kind in ('quote', 'invoice')),
  number text not null unique,
  contact_id uuid references contacts(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  status text not null default 'draft' check (
    status in ('draft', 'sent', 'accepted', 'paid', 'cancelled', 'overdue')
  ),
  issue_date date not null default current_date,
  due_date date,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'PHP',
  notes text,
  terms text,
  public_token text unique,
  paid_at timestamptz,
  transaction_id uuid references transactions(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists invoices_contact_idx on invoices (contact_id);
create index if not exists invoices_project_idx on invoices (project_id);
create index if not exists invoices_status_idx on invoices (status);
create index if not exists invoices_issue_date_idx on invoices (issue_date desc);
create index if not exists invoices_public_token_idx on invoices (public_token);

alter table invoices enable row level security;
drop policy if exists "service_role full access on invoices" on invoices;
create policy "service_role full access on invoices"
  on invoices for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
