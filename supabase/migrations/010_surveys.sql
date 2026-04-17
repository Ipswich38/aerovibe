-- Surveys: photogrammetry/mapping jobs. Each ties to a project and tracks processing state.

create table if not exists surveys (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  title text not null,
  status text not null default 'pending' check (
    status in ('pending', 'uploading', 'processing', 'complete', 'failed')
  ),
  survey_type text not null default '2d' check (survey_type in ('2d', '3d')),
  photo_count integer not null default 0,
  area_m2 numeric(12,2),
  gsd_cm_px numeric(6,2),
  altitude_m numeric(6,1),
  location text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  polygon jsonb,
  odm_task_id text,
  orthomosaic_url text,
  dsm_url text,
  model_3d_url text,
  report_url text,
  processing_started_at timestamptz,
  processing_finished_at timestamptz,
  error_message text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists surveys_project_idx on surveys (project_id);
create index if not exists surveys_status_idx on surveys (status);

alter table surveys enable row level security;

drop policy if exists "service_role full access on surveys" on surveys;
create policy "service_role full access on surveys"
  on surveys for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Deliverables: files associated with projects for the client delivery portal.

create table if not exists deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  file_type text not null check (
    file_type in ('orthomosaic', '3d_model', 'dsm', 'video', 'photo_set', 'report', 'other')
  ),
  file_url text,
  file_size_bytes bigint,
  thumbnail_url text,
  survey_id uuid references surveys(id) on delete set null,
  notes text,
  created_at timestamptz default now()
);

create index if not exists deliverables_project_idx on deliverables (project_id);

alter table deliverables enable row level security;

drop policy if exists "service_role full access on deliverables" on deliverables;
create policy "service_role full access on deliverables"
  on deliverables for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Add delivery_token to projects for public share link
alter table projects add column if not exists delivery_token text unique;
