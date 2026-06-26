-- ============================================================
-- Cascade deletes for diet template assignments
-- ------------------------------------------------------------
-- Deleting a diet_template was blocked by template_assignments
-- (and, transitively, food_check_ins) because the foreign keys
-- had no ON DELETE action. Re-create them with ON DELETE CASCADE
-- so removing a template cleans up its assignments and the
-- check-ins that reference those assignments.
-- ============================================================

-- food_check_ins.assignment_id -> template_assignments(id)
alter table food_check_ins
  drop constraint if exists food_check_ins_assignment_id_fkey;

alter table food_check_ins
  add constraint food_check_ins_assignment_id_fkey
  foreign key (assignment_id)
  references template_assignments(id)
  on delete cascade;

-- template_assignments.template_id -> diet_templates(id)
alter table template_assignments
  drop constraint if exists template_assignments_template_id_fkey;

alter table template_assignments
  add constraint template_assignments_template_id_fkey
  foreign key (template_id)
  references diet_templates(id)
  on delete cascade;
