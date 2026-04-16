-- Books: expenses + income. One table, kind discriminator.

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('income', 'expense')),
  date date not null default current_date,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'PHP',
  category text not null,
  vendor text,
  description text,
  receipt_url text,
  contact_id uuid references contacts(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists transactions_date_idx on transactions (date desc);
create index if not exists transactions_kind_idx on transactions (kind);
create index if not exists transactions_category_idx on transactions (category);

alter table transactions enable row level security;

drop policy if exists "service_role full access on transactions" on transactions;
create policy "service_role full access on transactions"
  on transactions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
