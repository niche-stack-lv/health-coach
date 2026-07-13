-- Ensure deleting a client (via auth.admin.deleteUser → cascades to profiles
-- → cascades to clients) also cleans up all their related rows.
--
-- Right now these child FKs default to NO ACTION which means deleting a
-- profile fails with an FK error. Adding ON DELETE CASCADE makes the whole
-- chain clean.

alter table public.check_ins            drop constraint if exists check_ins_client_id_fkey;
alter table public.check_ins            add  constraint check_ins_client_id_fkey            foreign key (client_id) references public.profiles(id) on delete cascade;

alter table public.food_check_ins       drop constraint if exists food_check_ins_client_id_fkey;
alter table public.food_check_ins       add  constraint food_check_ins_client_id_fkey       foreign key (client_id) references public.profiles(id) on delete cascade;

alter table public.measurements         drop constraint if exists measurements_client_id_fkey;
alter table public.measurements         add  constraint measurements_client_id_fkey         foreign key (client_id) references public.profiles(id) on delete cascade;

alter table public.habits               drop constraint if exists habits_client_id_fkey;
alter table public.habits               add  constraint habits_client_id_fkey               foreign key (client_id) references public.profiles(id) on delete cascade;

alter table public.habit_logs           drop constraint if exists habit_logs_client_id_fkey;
alter table public.habit_logs           add  constraint habit_logs_client_id_fkey           foreign key (client_id) references public.profiles(id) on delete cascade;

alter table public.diet_plans           drop constraint if exists diet_plans_client_id_fkey;
alter table public.diet_plans           add  constraint diet_plans_client_id_fkey           foreign key (client_id) references public.profiles(id) on delete cascade;

alter table public.workout_plans        drop constraint if exists workout_plans_client_id_fkey;
alter table public.workout_plans        add  constraint workout_plans_client_id_fkey        foreign key (client_id) references public.profiles(id) on delete cascade;

alter table public.workout_assignments  drop constraint if exists workout_assignments_client_id_fkey;
alter table public.workout_assignments  add  constraint workout_assignments_client_id_fkey  foreign key (client_id) references public.profiles(id) on delete cascade;

alter table public.template_assignments drop constraint if exists template_assignments_client_id_fkey;
alter table public.template_assignments add  constraint template_assignments_client_id_fkey foreign key (client_id) references public.profiles(id) on delete cascade;
