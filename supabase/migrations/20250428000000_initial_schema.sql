-- FitCoach — Initial Database Schema (baseline migration)
-- This is the full schema as of project launch.
-- All subsequent changes should be new migration files.

-- ============================================================
-- PROFILES — extends Supabase auth.users
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  role text not null check (role in ('coach', 'client'))
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Authenticated users can insert profiles"
  on profiles for insert with check (auth.role() = 'authenticated');

create policy "Coach can read all profiles"
  on profiles for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'coach')
  );

-- ============================================================
-- CLIENTS
-- ============================================================
create table if not exists clients (
  id uuid primary key references profiles(id) on delete cascade,
  coach_id uuid not null references profiles(id),
  created_at timestamptz default now(),
  goal text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  current_weight numeric,
  target_weight numeric
);

alter table clients enable row level security;

create policy "Coach can read own clients"
  on clients for select using (coach_id = auth.uid());

create policy "Coach can insert clients"
  on clients for insert with check (coach_id = auth.uid());

create policy "Coach can update own clients"
  on clients for update using (coach_id = auth.uid());

create policy "Client can read own record"
  on clients for select using (id = auth.uid());

-- ============================================================
-- DIET PLANS
-- ============================================================
create table if not exists diet_plans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  coach_id uuid not null references profiles(id),
  client_id uuid not null references profiles(id),
  title text not null,
  description text,
  start_date date,
  end_date date,
  weeks integer,
  status text not null default 'active' check (status in ('active', 'completed', 'draft'))
);

alter table diet_plans enable row level security;

create policy "Coach can manage own diet plans"
  on diet_plans for all using (coach_id = auth.uid());

create policy "Client can read own diet plans"
  on diet_plans for select using (client_id = auth.uid());

-- ============================================================
-- DIET MEALS
-- ============================================================
create table if not exists diet_meals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  plan_id uuid not null references diet_plans(id) on delete cascade,
  name text not null,
  time text,
  items text[] default '{}',
  calories integer default 0,
  protein integer default 0,
  carbs integer default 0,
  fat integer default 0,
  sort_order integer default 0
);

alter table diet_meals enable row level security;

create policy "Access via parent diet plan (coach)"
  on diet_meals for all using (
    exists (select 1 from diet_plans dp where dp.id = plan_id and dp.coach_id = auth.uid())
  );

create policy "Client can read own diet meals"
  on diet_meals for select using (
    exists (select 1 from diet_plans dp where dp.id = plan_id and dp.client_id = auth.uid())
  );

-- ============================================================
-- WORKOUT PLANS
-- ============================================================
create table if not exists workout_plans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  coach_id uuid not null references profiles(id),
  client_id uuid not null references profiles(id),
  title text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'draft'))
);

alter table workout_plans enable row level security;

create policy "Coach can manage own workout plans"
  on workout_plans for all using (coach_id = auth.uid());

create policy "Client can read own workout plans"
  on workout_plans for select using (client_id = auth.uid());

-- ============================================================
-- WORKOUT DAYS
-- ============================================================
create table if not exists workout_days (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  plan_id uuid not null references workout_plans(id) on delete cascade,
  day_label text not null,
  name text not null,
  exercises jsonb default '[]',
  sort_order integer default 0
);

alter table workout_days enable row level security;

create policy "Access via parent workout plan (coach)"
  on workout_days for all using (
    exists (select 1 from workout_plans wp where wp.id = plan_id and wp.coach_id = auth.uid())
  );

create policy "Client can read own workout days"
  on workout_days for select using (
    exists (select 1 from workout_plans wp where wp.id = plan_id and wp.client_id = auth.uid())
  );

-- ============================================================
-- CHECK-INS
-- ============================================================
create table if not exists check_ins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_id uuid not null references profiles(id),
  plan_id uuid references diet_plans(id),
  date date default current_date,
  week integer,
  weight numeric,
  notes text,
  photos jsonb default '[]',
  coach_feedback text,
  status text not null default 'pending' check (status in ('pending', 'reviewed'))
);

alter table check_ins enable row level security;

create policy "Client can insert own check-ins"
  on check_ins for insert with check (client_id = auth.uid());

create policy "Client can read own check-ins"
  on check_ins for select using (client_id = auth.uid());

create policy "Coach can read client check-ins"
  on check_ins for select using (
    exists (select 1 from clients c where c.id = client_id and c.coach_id = auth.uid())
  );

create policy "Coach can update client check-ins"
  on check_ins for update using (
    exists (select 1 from clients c where c.id = client_id and c.coach_id = auth.uid())
  );

-- ============================================================
-- MEASUREMENTS
-- ============================================================
create table if not exists measurements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_id uuid not null references profiles(id),
  date date default current_date,
  weight numeric,
  body_fat numeric,
  chest numeric,
  waist numeric,
  hips numeric,
  arms numeric,
  thighs numeric
);

alter table measurements enable row level security;

create policy "Client can manage own measurements"
  on measurements for all using (client_id = auth.uid());

create policy "Coach can read client measurements"
  on measurements for select using (
    exists (select 1 from clients c where c.id = client_id and c.coach_id = auth.uid())
  );

-- ============================================================
-- HABITS
-- ============================================================
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  coach_id uuid not null references profiles(id),
  client_id uuid not null references profiles(id),
  name text not null,
  emoji text default '✅',
  target text
);

alter table habits enable row level security;

create policy "Coach can manage habits"
  on habits for all using (coach_id = auth.uid());

create policy "Client can read own habits"
  on habits for select using (client_id = auth.uid());

-- ============================================================
-- HABIT LOGS
-- ============================================================
create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  habit_id uuid not null references habits(id) on delete cascade,
  client_id uuid not null references profiles(id),
  date date not null default current_date,
  completed boolean default false,
  value text
);

alter table habit_logs enable row level security;

create policy "Client can manage own habit logs"
  on habit_logs for all using (client_id = auth.uid());

create policy "Coach can read client habit logs"
  on habit_logs for select using (
    exists (select 1 from clients c where c.id = client_id and c.coach_id = auth.uid())
  );

-- ============================================================
-- LEADS
-- ============================================================
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  source text default 'website',
  name text,
  email text,
  phone text,
  goal text,
  program text,
  plan_type text,
  plan_label text,
  price text,
  duration text,
  age text,
  gender text,
  weight text,
  height text,
  diet text,
  gym text,
  experience text,
  injuries text,
  referral_source text,
  message text,
  status text default 'new'
);

alter table leads enable row level security;

create policy "Anyone can insert leads"
  on leads for insert with check (true);

create policy "Authenticated users can read leads"
  on leads for select using (auth.role() = 'authenticated');

create policy "Authenticated users can update leads"
  on leads for update using (auth.role() = 'authenticated');
