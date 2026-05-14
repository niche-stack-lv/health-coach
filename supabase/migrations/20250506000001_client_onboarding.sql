-- ============================================================
-- CLIENT ONBOARDING — captures intake form data on first login
-- ============================================================
create table if not exists client_onboarding (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),

  -- Goals & motivation
  primary_goal text,              -- e.g., "Lose weight", "Build muscle"
  other_goals text,               -- free text
  motivation text,                -- why they want to transform
  target_weight numeric,
  timeline text,                  -- e.g., "6-8 months"

  -- Body stats
  age integer,
  height text,                    -- e.g., "5'11" or "180cm"
  current_weight numeric,
  weight_history text,            -- free text about past weight

  -- Lifestyle
  activity_level text,            -- e.g., "Office gym 3x/week"
  work_type text,                 -- e.g., "Hybrid", "Remote", "Office"
  sleep_schedule text,            -- e.g., "12am - 8:30am"

  -- Nutrition (current habits)
  breakfast text,
  lunch text,
  snacks text,
  dinner text,
  weekends text,                  -- weekend eating/drinking habits
  pitfalls text,                  -- known challenges/triggers

  -- Medical
  medical_conditions text,        -- e.g., "Thyroid"
  injuries text,

  -- Additional
  notes text,

  -- Ensure one onboarding per client
  unique(client_id)
);

alter table client_onboarding enable row level security;

create policy "Client can insert own onboarding"
  on client_onboarding for insert with check (client_id = auth.uid());

create policy "Client can read own onboarding"
  on client_onboarding for select using (client_id = auth.uid());

create policy "Client can update own onboarding"
  on client_onboarding for update using (client_id = auth.uid());

create policy "Coach can read client onboarding"
  on client_onboarding for select using (
    exists (select 1 from clients c where c.id = client_id and c.coach_id = auth.uid())
  );
