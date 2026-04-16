-- Contracts: legal agreements signed by clients via public link.

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  template_key text,
  content text not null,
  variables jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'sent', 'signed', 'cancelled')),
  public_token text unique,
  client_signature_name text,
  signed_at timestamptz,
  signed_ip text,
  signed_user_agent text,
  sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists contracts_contact_idx on contracts (contact_id);
create index if not exists contracts_project_idx on contracts (project_id);
create index if not exists contracts_status_idx on contracts (status);
create index if not exists contracts_public_token_idx on contracts (public_token);

alter table contracts enable row level security;
drop policy if exists "service_role full access on contracts" on contracts;
create policy "service_role full access on contracts"
  on contracts for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
