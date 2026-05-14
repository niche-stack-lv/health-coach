-- ============================================================
-- DAILY CHECK-INS — meal-plan-aware daily tracking
-- ============================================================
drop table if exists daily_check_ins;

create table if not exists daily_check_ins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_id uuid not null references profiles(id),
  date date not null default current_date,

  -- Weight (optional)
  weight numeric,                 -- in lbs or kg (client preference)

  -- Meals from plan (array of meal names that were eaten)
  meals_eaten text[] default '{}',  -- e.g., ['Breakfast', 'Lunch', 'Dinner']
  total_plan_meals integer default 4,  -- how many meals are in the plan

  -- Off-plan meals
  other_meals text,               -- free text for off-plan food

  -- Notes
  notes text,

  -- Coach feedback
  coach_feedback text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewed')),

  -- One check-in per day per client
  unique(client_id, date)
);

alter table daily_check_ins enable row level security;

create policy "Client can insert own daily check-ins"
  on daily_check_ins for insert with check (client_id = auth.uid());

create policy "Client can read own daily check-ins"
  on daily_check_ins for select using (client_id = auth.uid());

create policy "Client can update today only"
  on daily_check_ins for update using (
    client_id = auth.uid() and date = current_date
  );

create policy "Coach can read client daily check-ins"
  on daily_check_ins for select using (
    exists (select 1 from clients c where c.id = client_id and c.coach_id = auth.uid())
  );

create policy "Coach can update client daily check-ins"
  on daily_check_ins for update using (
    exists (select 1 from clients c where c.id = client_id and c.coach_id = auth.uid())
  );
