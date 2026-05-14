-- ============================================================
-- DISHES & DIET DIRECTORY — composable nutrition system
-- Tables: dishes, dish_items, diet_templates, template_days,
--         template_meal_slots, meal_slot_components, meal_slot_dishes,
--         template_assignments, food_check_ins, food_check_in_items
-- ============================================================

-- ============================================================
-- DISHES — reusable recipes composed of food items
-- ============================================================
create table if not exists dishes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  coach_id uuid not null references profiles(id),
  name text not null,
  emoji text default '🍽️',
  component_category text not null check (component_category in ('carbohydrate', 'protein', 'fiber', 'complete_meal')),
  total_calories numeric default 0,
  total_protein numeric default 0,
  total_carbs numeric default 0,
  total_fat numeric default 0
);

alter table dishes enable row level security;

create policy "Coach can read own dishes"
  on dishes for select using (coach_id = auth.uid());

create policy "Coach can insert own dishes"
  on dishes for insert with check (coach_id = auth.uid());

create policy "Coach can update own dishes"
  on dishes for update using (coach_id = auth.uid());

create policy "Coach can delete own dishes"
  on dishes for delete using (coach_id = auth.uid());

-- ============================================================
-- DISH ITEMS — food items within a dish
-- ============================================================
create table if not exists dish_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  dish_id uuid not null references dishes(id) on delete cascade,
  food_id uuid references foods(id),
  custom_name text,
  custom_emoji text,
  custom_calories numeric,
  custom_protein numeric,
  custom_carbs numeric,
  custom_fat numeric,
  grams numeric not null,
  sort_order integer default 0
);

alter table dish_items enable row level security;

create policy "Coach can read own dish items"
  on dish_items for select using (
    exists (select 1 from dishes d where d.id = dish_id and d.coach_id = auth.uid())
  );

create policy "Coach can insert own dish items"
  on dish_items for insert with check (
    exists (select 1 from dishes d where d.id = dish_id and d.coach_id = auth.uid())
  );

create policy "Coach can update own dish items"
  on dish_items for update using (
    exists (select 1 from dishes d where d.id = dish_id and d.coach_id = auth.uid())
  );

create policy "Coach can delete own dish items"
  on dish_items for delete using (
    exists (select 1 from dishes d where d.id = dish_id and d.coach_id = auth.uid())
  );

-- ============================================================
-- DIET TEMPLATES — 7-day weekly plan templates
-- ============================================================
create table if not exists diet_templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  coach_id uuid not null references profiles(id),
  name text not null,
  plan_type text not null check (plan_type in ('veg', 'nonveg', 'low_carb_nonveg', 'intermittent_fasting'))
);

alter table diet_templates enable row level security;

create policy "Coach can read own templates"
  on diet_templates for select using (coach_id = auth.uid());

create policy "Coach can insert own templates"
  on diet_templates for insert with check (coach_id = auth.uid());

create policy "Coach can update own templates"
  on diet_templates for update using (coach_id = auth.uid());

create policy "Coach can delete own templates"
  on diet_templates for delete using (coach_id = auth.uid());

-- ============================================================
-- TEMPLATE DAYS — one row per day (7 per template)
-- Day 1=Sunday, 2=Monday, ..., 7=Saturday
-- ============================================================
create table if not exists template_days (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references diet_templates(id) on delete cascade,
  day_number integer not null check (day_number between 1 and 7),
  unique (template_id, day_number)
);

alter table template_days enable row level security;

create policy "Coach can read own template days"
  on template_days for select using (
    exists (select 1 from diet_templates dt where dt.id = template_id and dt.coach_id = auth.uid())
  );

create policy "Coach can insert own template days"
  on template_days for insert with check (
    exists (select 1 from diet_templates dt where dt.id = template_id and dt.coach_id = auth.uid())
  );

create policy "Coach can update own template days"
  on template_days for update using (
    exists (select 1 from diet_templates dt where dt.id = template_id and dt.coach_id = auth.uid())
  );

create policy "Coach can delete own template days"
  on template_days for delete using (
    exists (select 1 from diet_templates dt where dt.id = template_id and dt.coach_id = auth.uid())
  );

-- ============================================================
-- TEMPLATE MEAL SLOTS — meal occasions within a day
-- ============================================================
create table if not exists template_meal_slots (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references template_days(id) on delete cascade,
  name text not null,
  target_calories numeric,
  is_skipped boolean default false,
  sort_order integer default 0
);

alter table template_meal_slots enable row level security;

create policy "Coach can read own meal slots"
  on template_meal_slots for select using (
    exists (
      select 1 from template_days td
      join diet_templates dt on dt.id = td.template_id
      where td.id = day_id and dt.coach_id = auth.uid()
    )
  );

create policy "Coach can insert own meal slots"
  on template_meal_slots for insert with check (
    exists (
      select 1 from template_days td
      join diet_templates dt on dt.id = td.template_id
      where td.id = day_id and dt.coach_id = auth.uid()
    )
  );

create policy "Coach can update own meal slots"
  on template_meal_slots for update using (
    exists (
      select 1 from template_days td
      join diet_templates dt on dt.id = td.template_id
      where td.id = day_id and dt.coach_id = auth.uid()
    )
  );

create policy "Coach can delete own meal slots"
  on template_meal_slots for delete using (
    exists (
      select 1 from template_days td
      join diet_templates dt on dt.id = td.template_id
      where td.id = day_id and dt.coach_id = auth.uid()
    )
  );

-- ============================================================
-- MEAL SLOT COMPONENTS — component positions within a slot
-- ============================================================
create table if not exists meal_slot_components (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references template_meal_slots(id) on delete cascade,
  component_category text not null check (component_category in ('carbohydrate', 'protein', 'fiber', 'complete_meal')),
  sort_order integer default 0
);

alter table meal_slot_components enable row level security;

create policy "Coach can read own meal slot components"
  on meal_slot_components for select using (
    exists (
      select 1 from template_meal_slots tms
      join template_days td on td.id = tms.day_id
      join diet_templates dt on dt.id = td.template_id
      where tms.id = slot_id and dt.coach_id = auth.uid()
    )
  );

create policy "Coach can insert own meal slot components"
  on meal_slot_components for insert with check (
    exists (
      select 1 from template_meal_slots tms
      join template_days td on td.id = tms.day_id
      join diet_templates dt on dt.id = td.template_id
      where tms.id = slot_id and dt.coach_id = auth.uid()
    )
  );

create policy "Coach can update own meal slot components"
  on meal_slot_components for update using (
    exists (
      select 1 from template_meal_slots tms
      join template_days td on td.id = tms.day_id
      join diet_templates dt on dt.id = td.template_id
      where tms.id = slot_id and dt.coach_id = auth.uid()
    )
  );

create policy "Coach can delete own meal slot components"
  on meal_slot_components for delete using (
    exists (
      select 1 from template_meal_slots tms
      join template_days td on td.id = tms.day_id
      join diet_templates dt on dt.id = td.template_id
      where tms.id = slot_id and dt.coach_id = auth.uid()
    )
  );

-- ============================================================
-- MEAL SLOT DISHES — dish alternatives within a component
-- ============================================================
create table if not exists meal_slot_dishes (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references meal_slot_components(id) on delete cascade,
  dish_id uuid not null references dishes(id),
  sort_order integer default 0
);

alter table meal_slot_dishes enable row level security;

create policy "Coach can read own meal slot dishes"
  on meal_slot_dishes for select using (
    exists (
      select 1 from meal_slot_components msc
      join template_meal_slots tms on tms.id = msc.slot_id
      join template_days td on td.id = tms.day_id
      join diet_templates dt on dt.id = td.template_id
      where msc.id = component_id and dt.coach_id = auth.uid()
    )
  );

create policy "Coach can insert own meal slot dishes"
  on meal_slot_dishes for insert with check (
    exists (
      select 1 from meal_slot_components msc
      join template_meal_slots tms on tms.id = msc.slot_id
      join template_days td on td.id = tms.day_id
      join diet_templates dt on dt.id = td.template_id
      where msc.id = component_id and dt.coach_id = auth.uid()
    )
  );

create policy "Coach can update own meal slot dishes"
  on meal_slot_dishes for update using (
    exists (
      select 1 from meal_slot_components msc
      join template_meal_slots tms on tms.id = msc.slot_id
      join template_days td on td.id = tms.day_id
      join diet_templates dt on dt.id = td.template_id
      where msc.id = component_id and dt.coach_id = auth.uid()
    )
  );

create policy "Coach can delete own meal slot dishes"
  on meal_slot_dishes for delete using (
    exists (
      select 1 from meal_slot_components msc
      join template_meal_slots tms on tms.id = msc.slot_id
      join template_days td on td.id = tms.day_id
      join diet_templates dt on dt.id = td.template_id
      where msc.id = component_id and dt.coach_id = auth.uid()
    )
  );

-- ============================================================
-- TEMPLATE ASSIGNMENTS — simple one-active-at-a-time link
-- ============================================================
create table if not exists template_assignments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  template_id uuid not null references diet_templates(id),
  client_id uuid not null references profiles(id),
  coach_id uuid not null references profiles(id),
  status text not null default 'active' check (status in ('active', 'inactive'))
);

alter table template_assignments enable row level security;

create policy "Coach can read own assignments"
  on template_assignments for select using (coach_id = auth.uid());

create policy "Coach can insert own assignments"
  on template_assignments for insert with check (coach_id = auth.uid());

create policy "Coach can update own assignments"
  on template_assignments for update using (coach_id = auth.uid());

create policy "Coach can delete own assignments"
  on template_assignments for delete using (coach_id = auth.uid());

create policy "Client can read own assignments"
  on template_assignments for select using (client_id = auth.uid());

-- ============================================================
-- FOOD CHECK-INS — daily food logging by client
-- ============================================================
create table if not exists food_check_ins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_id uuid not null references profiles(id),
  assignment_id uuid not null references template_assignments(id),
  date date not null default current_date,
  total_calories numeric default 0,
  total_protein numeric default 0,
  total_carbs numeric default 0,
  total_fat numeric default 0,
  adherence_score numeric default 0,
  unique (client_id, date)
);

alter table food_check_ins enable row level security;

create policy "Client can read own food check-ins"
  on food_check_ins for select using (client_id = auth.uid());

create policy "Client can insert own food check-ins"
  on food_check_ins for insert with check (client_id = auth.uid());

create policy "Client can update own food check-ins"
  on food_check_ins for update using (client_id = auth.uid());

create policy "Client can delete own food check-ins"
  on food_check_ins for delete using (client_id = auth.uid());

create policy "Coach can read client food check-ins"
  on food_check_ins for select using (
    exists (select 1 from clients c where c.id = client_id and c.coach_id = auth.uid())
  );

-- ============================================================
-- FOOD CHECK-IN ITEMS — individual selections per component
-- ============================================================
create table if not exists food_check_in_items (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid not null references food_check_ins(id) on delete cascade,
  slot_id uuid not null references template_meal_slots(id),
  component_id uuid not null references meal_slot_components(id),
  dish_id uuid references dishes(id),
  is_skipped boolean default false
);

alter table food_check_in_items enable row level security;

create policy "Client can read own food check-in items"
  on food_check_in_items for select using (
    exists (select 1 from food_check_ins fci where fci.id = check_in_id and fci.client_id = auth.uid())
  );

create policy "Client can insert own food check-in items"
  on food_check_in_items for insert with check (
    exists (select 1 from food_check_ins fci where fci.id = check_in_id and fci.client_id = auth.uid())
  );

create policy "Client can update own food check-in items"
  on food_check_in_items for update using (
    exists (select 1 from food_check_ins fci where fci.id = check_in_id and fci.client_id = auth.uid())
  );

create policy "Client can delete own food check-in items"
  on food_check_in_items for delete using (
    exists (select 1 from food_check_ins fci where fci.id = check_in_id and fci.client_id = auth.uid())
  );

create policy "Coach can read client food check-in items"
  on food_check_in_items for select using (
    exists (
      select 1 from food_check_ins fci
      join clients c on c.id = fci.client_id
      where fci.id = check_in_id and c.coach_id = auth.uid()
    )
  );

-- ============================================================
-- INDEXES — foreign key columns for query performance
-- ============================================================

-- dishes
create index idx_dishes_coach_id on dishes(coach_id);

-- dish_items
create index idx_dish_items_dish_id on dish_items(dish_id);
create index idx_dish_items_food_id on dish_items(food_id);

-- diet_templates
create index idx_diet_templates_coach_id on diet_templates(coach_id);

-- template_days
create index idx_template_days_template_id on template_days(template_id);

-- template_meal_slots
create index idx_template_meal_slots_day_id on template_meal_slots(day_id);

-- meal_slot_components
create index idx_meal_slot_components_slot_id on meal_slot_components(slot_id);

-- meal_slot_dishes
create index idx_meal_slot_dishes_component_id on meal_slot_dishes(component_id);
create index idx_meal_slot_dishes_dish_id on meal_slot_dishes(dish_id);

-- template_assignments
create index idx_template_assignments_template_id on template_assignments(template_id);
create index idx_template_assignments_client_id on template_assignments(client_id);
create index idx_template_assignments_coach_id on template_assignments(coach_id);

-- food_check_ins
create index idx_food_check_ins_client_id on food_check_ins(client_id);
create index idx_food_check_ins_assignment_id on food_check_ins(assignment_id);

-- food_check_in_items
create index idx_food_check_in_items_check_in_id on food_check_in_items(check_in_id);
create index idx_food_check_in_items_slot_id on food_check_in_items(slot_id);
create index idx_food_check_in_items_component_id on food_check_in_items(component_id);
create index idx_food_check_in_items_dish_id on food_check_in_items(dish_id);


-- ============================================================
-- CLIENT-READ RLS POLICIES (defined after all tables exist)
-- ============================================================

create policy "Client can read dishes via template assignment"
  on dishes for select using (
    exists (
      select 1 from template_assignments ta
      join diet_templates dt on dt.id = ta.template_id
      join template_days td on td.template_id = dt.id
      join template_meal_slots tms on tms.day_id = td.id
      join meal_slot_components msc on msc.slot_id = tms.id
      join meal_slot_dishes msd on msd.component_id = msc.id
      where msd.dish_id = dishes.id
        and ta.client_id = auth.uid()
        and ta.status = 'active'
    )
  );

create policy "Client can read dish items via template assignment"
  on dish_items for select using (
    exists (
      select 1 from dishes d
      join meal_slot_dishes msd on msd.dish_id = d.id
      join meal_slot_components msc on msc.id = msd.component_id
      join template_meal_slots tms on tms.id = msc.slot_id
      join template_days td on td.id = tms.day_id
      join diet_templates dt on dt.id = td.template_id
      join template_assignments ta on ta.template_id = dt.id
      where d.id = dish_items.dish_id
        and ta.client_id = auth.uid()
        and ta.status = 'active'
    )
  );

create policy "Client can read templates via assignment"
  on diet_templates for select using (
    exists (
      select 1 from template_assignments ta
      where ta.template_id = diet_templates.id
        and ta.client_id = auth.uid()
        and ta.status = 'active'
    )
  );

create policy "Client can read template days via assignment"
  on template_days for select using (
    exists (
      select 1 from diet_templates dt
      join template_assignments ta on ta.template_id = dt.id
      where dt.id = template_days.template_id
        and ta.client_id = auth.uid()
        and ta.status = 'active'
    )
  );

create policy "Client can read meal slots via assignment"
  on template_meal_slots for select using (
    exists (
      select 1 from template_days td
      join diet_templates dt on dt.id = td.template_id
      join template_assignments ta on ta.template_id = dt.id
      where td.id = template_meal_slots.day_id
        and ta.client_id = auth.uid()
        and ta.status = 'active'
    )
  );

create policy "Client can read meal slot components via assignment"
  on meal_slot_components for select using (
    exists (
      select 1 from template_meal_slots tms
      join template_days td on td.id = tms.day_id
      join diet_templates dt on dt.id = td.template_id
      join template_assignments ta on ta.template_id = dt.id
      where tms.id = meal_slot_components.slot_id
        and ta.client_id = auth.uid()
        and ta.status = 'active'
    )
  );

create policy "Client can read meal slot dishes via assignment"
  on meal_slot_dishes for select using (
    exists (
      select 1 from meal_slot_components msc
      join template_meal_slots tms on tms.id = msc.slot_id
      join template_days td on td.id = tms.day_id
      join diet_templates dt on dt.id = td.template_id
      join template_assignments ta on ta.template_id = dt.id
      where msc.id = meal_slot_dishes.component_id
        and ta.client_id = auth.uid()
        and ta.status = 'active'
    )
  );
