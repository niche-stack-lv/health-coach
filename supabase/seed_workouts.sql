-- ============================================================
-- SEED: DesiSquats Workout Plans (11 programs)
-- Run AFTER migrations: 20250511000000_workout_templates.sql
--                       20250528000000_workout_phases.sql
--
-- IMPORTANT: Replace the coach_id below with your actual coach UUID
-- Find it: SELECT id FROM profiles WHERE role = 'coach';
-- ============================================================

DO $$
DECLARE
  v_coach uuid := 'fdc7c8d4-04c7-4e2e-a7bb-2a1b21a8433e'; -- REPLACE WITH YOUR COACH UUID

  -- Exercise IDs (existing defaults from 20250506000000_foods_and_exercises.sql)
  e_squat        uuid; e_legpress     uuid; e_rdl          uuid;
  e_legext       uuid; e_legcurl      uuid; e_calfraise    uuid;
  e_bsquat       uuid; e_bench        uuid; e_incdb        uuid;
  e_latpull      uuid; e_cablerow     uuid; e_pullup       uuid;
  e_ohpress      uuid; e_lateraise    uuid; e_facepull     uuid;
  e_bbcurl       uuid; e_hammer       uuid; e_triceppush   uuid;
  e_hangleg      uuid; e_plank        uuid; e_deadlift     uuid;
  e_barbellrow   uuid; e_pecdeck      uuid; e_preacher     uuid;

  -- New exercises for home/bodyweight/bands
  e_pushup       uuid; e_glutebridge  uuid; e_lunge        uuid;
  e_superman     uuid; e_highknees    uuid; e_mountclimb   uuid;
  e_russtwist    uuid; e_legraise     uuid; e_biccrnch     uuid;
  e_sideplank    uuid; e_calfbw       uuid; e_stepup       uuid;
  e_bwdeadlift   uuid; e_wallsit      uuid; e_sidelunge    uuid;
  e_birddog      uuid; e_clamshell    uuid; e_tricdip      uuid;
  e_bandrow      uuid; e_bandshpress  uuid; e_banddeadlift uuid;
  e_bandglute    uuid; e_bandlegrise  uuid; e_bandsidestep uuid;
  e_burpee       uuid; e_bandsqtpress uuid; e_dbshpress    uuid;
  e_dblunge      uuid; e_dbsidebend   uuid; e_dbsqtpress   uuid;
  e_dbstepup     uuid; e_dbglute      uuid; e_updownplank  uuid;
  e_deadbug      uuid; e_singlelegbal uuid; e_hollowbody   uuid;
  e_plankshldtap uuid; e_sideplankdip uuid; e_bandchestprs uuid;
  e_bandbiccurl  uuid; e_bandlatwalks uuid; e_dbdeadlift   uuid;
  e_farmerscarry uuid; e_inclinedbprs uuid; e_dbfly        uuid;
  e_cablefly     uuid; e_arnoldpress  uuid; e_tbarrow      uuid;
  e_hacksquat    uuid; e_boxsquat     uuid; e_pushpress    uuid;
  e_wgtpullup    uuid; e_wgtplank     uuid; e_wgtstep      uuid;
  e_frontsquat   uuid; e_wgtrustwist  uuid; e_cablewoodchp uuid;
  e_hipthrust    uuid; e_walklunge    uuid; e_splitlunge   uuid;
  e_cablecrunch  uuid; e_incbarbprs   uuid; e_dbrow        uuid;

  -- Template + phase + slot IDs
  t_id uuid; p1 uuid; p2 uuid; p3 uuid; p4 uuid;
  s_id uuid;
BEGIN

-- ============================================================
-- STEP 1: Fetch existing default exercise IDs
-- ============================================================
SELECT id INTO e_squat      FROM exercises WHERE name = 'Barbell Squat'        AND is_default = true LIMIT 1;
SELECT id INTO e_legpress   FROM exercises WHERE name = 'Leg Press'             AND is_default = true LIMIT 1;
SELECT id INTO e_rdl        FROM exercises WHERE name = 'Romanian Deadlift'     AND is_default = true LIMIT 1;
SELECT id INTO e_legext     FROM exercises WHERE name = 'Leg Extension'         AND is_default = true LIMIT 1;
SELECT id INTO e_legcurl    FROM exercises WHERE name = 'Leg Curl'              AND is_default = true LIMIT 1;
SELECT id INTO e_calfraise  FROM exercises WHERE name = 'Calf Raises'           AND is_default = true LIMIT 1;
SELECT id INTO e_bsquat     FROM exercises WHERE name = 'Bulgarian Split Squat' AND is_default = true LIMIT 1;
SELECT id INTO e_bench      FROM exercises WHERE name = 'Flat Bench Press'      AND is_default = true LIMIT 1;
SELECT id INTO e_incdb      FROM exercises WHERE name = 'Incline Dumbbell Press' AND is_default = true LIMIT 1;
SELECT id INTO e_latpull    FROM exercises WHERE name = 'Lat Pulldown'          AND is_default = true LIMIT 1;
SELECT id INTO e_cablerow   FROM exercises WHERE name = 'Seated Cable Row'      AND is_default = true LIMIT 1;
SELECT id INTO e_pullup     FROM exercises WHERE name = 'Pull-ups'              AND is_default = true LIMIT 1;
SELECT id INTO e_ohpress    FROM exercises WHERE name = 'Overhead Press'        AND is_default = true LIMIT 1;
SELECT id INTO e_lateraise  FROM exercises WHERE name = 'Lateral Raises'        AND is_default = true LIMIT 1;
SELECT id INTO e_facepull   FROM exercises WHERE name = 'Face Pulls'            AND is_default = true LIMIT 1;
SELECT id INTO e_bbcurl     FROM exercises WHERE name = 'Barbell Curl'          AND is_default = true LIMIT 1;
SELECT id INTO e_hammer     FROM exercises WHERE name = 'Hammer Curls'          AND is_default = true LIMIT 1;
SELECT id INTO e_triceppush FROM exercises WHERE name = 'Tricep Pushdown'       AND is_default = true LIMIT 1;
SELECT id INTO e_hangleg    FROM exercises WHERE name = 'Hanging Leg Raise'     AND is_default = true LIMIT 1;
SELECT id INTO e_plank      FROM exercises WHERE name = 'Plank'                 AND is_default = true LIMIT 1;
SELECT id INTO e_deadlift   FROM exercises WHERE name = 'Deadlift'              AND is_default = true LIMIT 1;
SELECT id INTO e_barbellrow FROM exercises WHERE name = 'Barbell Row'           AND is_default = true LIMIT 1;
SELECT id INTO e_pecdeck    FROM exercises WHERE name = 'Pec Deck Machine'      AND is_default = true LIMIT 1;
SELECT id INTO e_preacher   FROM exercises WHERE name = 'Preacher Curl'         AND is_default = true LIMIT 1;
SELECT id INTO e_cablecrunch FROM exercises WHERE name = 'Cable Crunch'         AND is_default = true LIMIT 1;

-- ============================================================
-- STEP 2: Insert new exercises (bodyweight, bands, dumbbell, etc.)
-- ============================================================
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Push-Ups',                    'chest',    '💪', 'Bodyweight',       true) RETURNING id INTO e_pushup;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Glute Bridge',                'legs',     '🦵', 'Bodyweight',       true) RETURNING id INTO e_glutebridge;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Lunges',                      'legs',     '🦵', 'Bodyweight',       true) RETURNING id INTO e_lunge;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Superman',                    'back',     '💪', 'Bodyweight',       true) RETURNING id INTO e_superman;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('High Knees',                  'cardio',   '🏃', 'Bodyweight',       true) RETURNING id INTO e_highknees;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Mountain Climbers',           'cardio',   '🏃', 'Bodyweight',       true) RETURNING id INTO e_mountclimb;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Russian Twists',              'core',     '🎯', 'Bodyweight',       true) RETURNING id INTO e_russtwist;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Leg Raises',                  'core',     '🎯', 'Bodyweight',       true) RETURNING id INTO e_legraise;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Bicycle Crunches',            'core',     '🎯', 'Bodyweight',       true) RETURNING id INTO e_biccrnch;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Side Plank',                  'core',     '🎯', 'Bodyweight',       true) RETURNING id INTO e_sideplank;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Standing Calf Raises',        'legs',     '🦵', 'Bodyweight',       true) RETURNING id INTO e_calfbw;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Step-Ups',                    'legs',     '🦵', 'Bodyweight',       true) RETURNING id INTO e_stepup;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Bodyweight Deadlift',         'legs',     '🦵', 'Bodyweight',       true) RETURNING id INTO e_bwdeadlift;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Wall Sit',                    'legs',     '🦵', 'Bodyweight',       true) RETURNING id INTO e_wallsit;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Side Lunges',                 'legs',     '🦵', 'Bodyweight',       true) RETURNING id INTO e_sidelunge;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Bird Dog',                    'core',     '🎯', 'Bodyweight',       true) RETURNING id INTO e_birddog;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Clamshells',                  'legs',     '🦵', 'Bodyweight',       true) RETURNING id INTO e_clamshell;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Tricep Dips',                 'arms',     '💪', 'Bodyweight',       true) RETURNING id INTO e_tricdip;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Resistance Band Rows',        'back',     '💪', 'Resistance Band',  true) RETURNING id INTO e_bandrow;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Band Shoulder Press',         'shoulders','🔥', 'Resistance Band',  true) RETURNING id INTO e_bandshpress;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Band Deadlifts',              'legs',     '🦵', 'Resistance Band',  true) RETURNING id INTO e_banddeadlift;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Band Glute Bridge',           'legs',     '🦵', 'Resistance Band',  true) RETURNING id INTO e_bandglute;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Band Side-Lying Leg Raises',  'legs',     '🦵', 'Resistance Band',  true) RETURNING id INTO e_bandlegrise;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Banded Side Steps',           'legs',     '🦵', 'Resistance Band',  true) RETURNING id INTO e_bandsidestep;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Burpees',                     'cardio',   '🏃', 'Bodyweight',       true) RETURNING id INTO e_burpee;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Band Squat to Overhead Press','legs',     '🦵', 'Resistance Band',  true) RETURNING id INTO e_bandsqtpress;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Dumbbell Shoulder Press',     'shoulders','🔥', 'Dumbbells',        true) RETURNING id INTO e_dbshpress;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Dumbbell Lunges',             'legs',     '🦵', 'Dumbbells',        true) RETURNING id INTO e_dblunge;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Dumbbell Side Bend',          'core',     '🎯', 'Dumbbells',        true) RETURNING id INTO e_dbsidebend;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Dumbbell Squat to Press',     'legs',     '🦵', 'Dumbbells',        true) RETURNING id INTO e_dbsqtpress;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Dumbbell Step-Ups',           'legs',     '🦵', 'Dumbbells',        true) RETURNING id INTO e_dbstepup;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Glute Bridge with Dumbbell',  'legs',     '🦵', 'Dumbbells',        true) RETURNING id INTO e_dbglute;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Up-Down Planks',              'core',     '🎯', 'Bodyweight',       true) RETURNING id INTO e_updownplank;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Dead Bug',                    'core',     '🎯', 'Bodyweight',       true) RETURNING id INTO e_deadbug;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Single-Leg Balance',          'legs',     '🦵', 'Bodyweight',       true) RETURNING id INTO e_singlelegbal;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Hollow Body Hold',            'core',     '🎯', 'Bodyweight',       true) RETURNING id INTO e_hollowbody;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Plank with Shoulder Taps',    'core',     '🎯', 'Bodyweight',       true) RETURNING id INTO e_plankshldtap;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Side Plank with Hip Dip',     'core',     '🎯', 'Bodyweight',       true) RETURNING id INTO e_sideplankdip;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Band Chest Press',            'chest',    '🏋️', 'Resistance Band',  true) RETURNING id INTO e_bandchestprs;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Band Bicep Curls',            'arms',     '💪', 'Resistance Band',  true) RETURNING id INTO e_bandbiccurl;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Band Lateral Walks',          'legs',     '🦵', 'Resistance Band',  true) RETURNING id INTO e_bandlatwalks;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Dumbbell Deadlifts',          'legs',     '🦵', 'Dumbbells',        true) RETURNING id INTO e_dbdeadlift;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Farmers Carry',               'back',     '💪', 'Dumbbells',        true) RETURNING id INTO e_farmerscarry;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Incline Barbell Press',       'chest',    '🏋️', 'Barbell',          true) RETURNING id INTO e_inclinedbprs;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Dumbbell Flyes',              'chest',    '🏋️', 'Dumbbells',        true) RETURNING id INTO e_dbfly;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Arnold Press',                'shoulders','🔥', 'Dumbbells',        true) RETURNING id INTO e_arnoldpress;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('T-Bar Rows',                  'back',     '💪', 'Barbell',          true) RETURNING id INTO e_tbarrow;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Hack Squats',                 'legs',     '🦵', 'Machine',          true) RETURNING id INTO e_hacksquat;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Box Squats',                  'legs',     '🦵', 'Barbell',          true) RETURNING id INTO e_boxsquat;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Push Press',                  'shoulders','🔥', 'Barbell',          true) RETURNING id INTO e_pushpress;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Weighted Pull-Ups',           'back',     '💪', 'Bodyweight',       true) RETURNING id INTO e_wgtpullup;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Weighted Plank',              'core',     '🎯', 'Bodyweight',       true) RETURNING id INTO e_wgtplank;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Weighted Step-Ups',           'legs',     '🦵', 'Dumbbells',        true) RETURNING id INTO e_wgtstep;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Front Squats',                'legs',     '🦵', 'Barbell',          true) RETURNING id INTO e_frontsquat;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Weighted Russian Twists',     'core',     '🎯', 'Dumbbells',        true) RETURNING id INTO e_wgtrustwist;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Cable Woodchoppers',          'core',     '🎯', 'Cable',            true) RETURNING id INTO e_cablewoodchp;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Hip Thrusts',                 'legs',     '🦵', 'Barbell',          true) RETURNING id INTO e_hipthrust;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Walking Lunges',              'legs',     '🦵', 'Bodyweight',       true) RETURNING id INTO e_walklunge;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Split Squats',                'legs',     '🦵', 'Dumbbells',        true) RETURNING id INTO e_splitlunge;
INSERT INTO exercises (name, category, emoji, equipment, is_default) VALUES ('Dumbbell Rows',               'back',     '💪', 'Dumbbells',        true) RETURNING id INTO e_dbrow;

-- ============================================================
-- PLAN 1: PLAN_H3 — Beginner at Home, 3 Days/Week, 3 Phases
-- ============================================================
INSERT INTO workout_templates (coach_id, name, description, level, location, is_template)
VALUES (v_coach, 'Beginner at Home – 3 Days/Week', 'Bodyweight → Resistance Bands → Dumbbells (progressive 3-phase)', 'Beginner', 'Home', true)
RETURNING id INTO t_id;

INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 1: Bodyweights',      0, 1,  6) RETURNING id INTO p1;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 2: Resistance Bands', 1, 7,  12) RETURNING id INTO p2;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 3: Dumbbells',        2, 13, 18) RETURNING id INTO p3;

-- Phase 1 Day 1
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 1 – Full Body Strength', 0, 'Arm circles and shoulder stretches (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id, e_squat,      4, '15',    60, 0), (s_id, e_pushup,     4, '10-15', 60, 1),
  (s_id, e_glutebridge,4, '15-20', 60, 2), (s_id, e_lunge,      4, '12',    60, 3),
  (s_id, e_plank,      3, '30-45 sec', 45, 4), (s_id, e_superman, 3, '15-20', 45, 5);

-- Phase 1 Day 2
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 2 – Cardio & Core', 1, 'Dynamic stretches – leg swings, bodyweight squats (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id, e_highknees,  4, '30 sec', 30, 0), (s_id, e_mountclimb, 4, '20-30 sec', 30, 1),
  (s_id, e_russtwist,  4, '20',     45, 2), (s_id, e_legraise,   4, '15',     45, 3),
  (s_id, e_biccrnch,   4, '20',     45, 4), (s_id, e_sideplank,  3, '20-30 sec', 30, 5);

-- Phase 1 Day 3
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 3 – Lower Body & Balance', 2, 'Light dynamic stretching (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id, e_calfbw,     4, '20',    45, 0), (s_id, e_stepup,     4, '12',    60, 1),
  (s_id, e_bwdeadlift, 4, '12',    60, 2), (s_id, e_wallsit,    4, '45 sec',45, 3),
  (s_id, e_sidelunge,  4, '10',    60, 4), (s_id, e_birddog,    4, '12',    45, 5),
  (s_id, e_clamshell,  3, '15',    45, 6);

-- Phase 2 Day 1
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p2, 'Day 1 – Upper Body & Core', 3, 'Arm circles 1 min, shoulder taps 1 min, high knees 1 min, band pull-aparts 1 min') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id, e_pushup,       4, '10-15', 60, 0), (s_id, e_bandrow,      4, '12-15', 60, 1),
  (s_id, e_tricdip,      3, '12-15', 60, 2), (s_id, e_bandshpress,  4, '10-12', 60, 3),
  (s_id, e_plankshldtap, 3, '20',    45, 4), (s_id, e_biccrnch,     3, '20',    45, 5);

-- Phase 2 Day 2
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p2, 'Day 2 – Lower Body & Core', 4, 'Bodyweight squats, high knees, glute bridges, leg swings (5-10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id, e_squat,       4, '15-20', 60, 0), (s_id, e_banddeadlift, 4, '12-15', 60, 1),
  (s_id, e_lunge,       3, '10',    60, 2), (s_id, e_bandglute,    4, '15-20', 60, 3),
  (s_id, e_bandlegrise, 3, '15',    45, 4), (s_id, e_russtwist,    3, '20',    45, 5);

-- Phase 2 Day 3
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p2, 'Day 3 – Full Body', 5, 'Jumping jacks, arm circles, bodyweight squats, light lunges (5-10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id, e_burpee,       4, '10',    60, 0), (s_id, e_bandsqtpress, 4, '10-12', 60, 1),
  (s_id, e_mountclimb,   3, '30 sec',30, 2), (s_id, e_bandrow,      4, '12-15', 60, 3),
  (s_id, e_bandsidestep, 3, '15',    45, 4), (s_id, e_biccrnch,     3, '20',    45, 5);

-- Phase 3 Day 1
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p3, 'Day 1 – Upper Body Strength', 6, 'Arm circles, jumping jacks, shoulder taps, band pull-aparts (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id, e_pushup,      3, '10-12', 60, 0), (s_id, e_bandrow,     3, '12-15', 60, 1),
  (s_id, e_dbshpress,   3, '10-12', 60, 2), (s_id, e_bandbiccurl, 3, '12-15', 45, 3),
  (s_id, e_tricdip,     3, '10-12', 45, 4), (s_id, e_plankshldtap,3, '20',    45, 5);

-- Phase 3 Day 2
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p3, 'Day 2 – Lower Body Strength', 7, 'High knees, bodyweight squats, glute bridges, leg swings (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id, e_squat,       3, '15-20', 60, 0), (s_id, e_dblunge,     3, '10',    60, 1),
  (s_id, e_banddeadlift,3, '12-15', 60, 2), (s_id, e_bandglute,   3, '15',    60, 3),
  (s_id, e_calfraise,   3, '15-20', 45, 4), (s_id, e_bandlegrise, 3, '15',    45, 5);

-- Phase 3 Day 3
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p3, 'Day 3 – Core & Stability', 8, 'Jumping jacks, high knees, arm circles, light twists (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id, e_plank,       3, '45-60 sec', 45, 0), (s_id, e_russtwist,  3, '20',    45, 1),
  (s_id, e_legraise,    3, '12-15', 45, 2), (s_id, e_dbsidebend, 3, '12',    45, 3),
  (s_id, e_biccrnch,    3, '20',    45, 4), (s_id, e_mountclimb, 3, '30 sec',30, 5);

-- ============================================================
-- PLAN 2: PLAN_H4 — Beginner at Home, 4 Days/Week
-- ============================================================
INSERT INTO workout_templates (coach_id, name, description, level, location, is_template)
VALUES (v_coach, 'Beginner at Home – 4 Days/Week', 'Same phases as 3-day + dedicated recovery/flexibility day', 'Beginner', 'Home', true)
RETURNING id INTO t_id;

INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 1: Bodyweights',      0, 1,  6) RETURNING id INTO p1;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 2: Resistance Bands', 1, 7,  12) RETURNING id INTO p2;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 3: Dumbbells',        2, 13, 18) RETURNING id INTO p3;

-- Phase 1
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 1 – Full Body Strength', 0, 'Arm circles and shoulder stretches (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id, e_squat, 4,'15',60,0),(s_id,e_pushup,4,'10-15',60,1),(s_id,e_glutebridge,4,'15-20',60,2),
  (s_id,e_lunge,4,'12',60,3),(s_id,e_plank,3,'30-45 sec',45,4),(s_id,e_superman,3,'15-20',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 2 – Cardio & Core', 1, 'Dynamic stretches (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_highknees,4,'30 sec',30,0),(s_id,e_mountclimb,4,'20-30 sec',30,1),(s_id,e_russtwist,4,'20',45,2),
  (s_id,e_legraise,4,'15',45,3),(s_id,e_biccrnch,4,'20',45,4),(s_id,e_sideplank,3,'20-30 sec',30,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 3 – Lower Body & Balance', 2, 'Light dynamic stretching (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_calfbw,4,'20',45,0),(s_id,e_stepup,4,'12',60,1),(s_id,e_bwdeadlift,4,'12',60,2),
  (s_id,e_wallsit,4,'45 sec',45,3),(s_id,e_sidelunge,4,'10',60,4),(s_id,e_birddog,4,'12',45,5),(s_id,e_clamshell,3,'15',45,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 4 – Active Recovery & Flexibility', 3, 'Leg swings, arm swings, shoulder circles (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_deadbug,3,'15',45,0),(s_id,e_glutebridge,3,'15',45,1),(s_id,e_singlelegbal,3,'30 sec',30,2);

-- Phase 2
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p2, 'Day 1 – Upper Body Strength & Endurance', 4, 'Arm circles, jumping jacks, shoulder taps, band pull-aparts, light band rows (10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_pushup,4,'12-15',60,0),(s_id,e_bandchestprs,4,'12-15',60,1),(s_id,e_bandrow,4,'12-15',60,2),
  (s_id,e_tricdip,3,'12-15',60,3),(s_id,e_bandbiccurl,4,'12-15',45,4),(s_id,e_plankshldtap,3,'20',45,5),(s_id,e_russtwist,3,'20',45,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p2, 'Day 2 – Lower Body & Core', 5, 'High knees, bodyweight squats, glute bridges, leg swings, light lunges (10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,4,'15-20',60,0),(s_id,e_banddeadlift,4,'12-15',60,1),(s_id,e_lunge,3,'10',60,2),
  (s_id,e_bandglute,4,'15-20',60,3),(s_id,e_bandlegrise,3,'15',45,4),(s_id,e_biccrnch,3,'20',45,5),(s_id,e_plank,3,'45 sec',45,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p2, 'Day 3 – Full Body & Cardio', 6, 'Jump rope or high knees 2 min, arm circles, light lunges, shoulder taps (10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_burpee,4,'12',60,0),(s_id,e_bandsqtpress,4,'12',60,1),(s_id,e_mountclimb,3,'45 sec',30,2),
  (s_id,e_bandrow,4,'12-15',60,3),(s_id,e_bandsidestep,3,'15',45,4),(s_id,e_biccrnch,3,'20',45,5),(s_id,e_highknees,3,'45 sec',30,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p2, 'Day 4 – Core & Mobility', 7, 'Jumping jacks, plank to downward dog, arm circles, bodyweight squats (10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_plank,4,'1 min',45,0),(s_id,e_legraise,3,'15',45,1),(s_id,e_russtwist,3,'20',45,2),
  (s_id,e_sideplankdip,3,'12',45,3),(s_id,e_biccrnch,3,'20',45,4),(s_id,e_bandglute,4,'20',60,5);

-- Phase 3
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p3, 'Day 1 – Upper Body Strength', 8, 'Arm circles, jumping jacks, shoulder taps, band pull-aparts (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_pushup,3,'10-12',60,0),(s_id,e_bandrow,3,'12-15',60,1),(s_id,e_dbshpress,3,'10-12',60,2),
  (s_id,e_bandbiccurl,3,'12-15',45,3),(s_id,e_tricdip,3,'10-12',45,4),(s_id,e_plankshldtap,3,'20',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p3, 'Day 2 – Lower Body Strength', 9, 'High knees, bodyweight squats, glute bridges, leg swings (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,3,'15-20',60,0),(s_id,e_dblunge,3,'10',60,1),(s_id,e_banddeadlift,3,'12-15',60,2),
  (s_id,e_bandglute,3,'15',60,3),(s_id,e_calfraise,3,'15-20',45,4),(s_id,e_bandlegrise,3,'15',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p3, 'Day 3 – Core & Stability', 10, 'Jumping jacks, high knees, arm circles, light twists (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_plank,3,'45-60 sec',45,0),(s_id,e_russtwist,3,'20',45,1),(s_id,e_legraise,3,'12-15',45,2),
  (s_id,e_dbsidebend,3,'12',45,3),(s_id,e_biccrnch,3,'20',45,4),(s_id,e_mountclimb,3,'30 sec',30,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p3, 'Day 4 – Upper & Lower Combo', 11, 'High knees, arm circles, bodyweight squats, light lunges (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_dbsqtpress,3,'10-12',60,0),(s_id,e_pushup,3,'10',60,1),(s_id,e_bandrow,3,'12',60,2),
  (s_id,e_dbstepup,3,'10',60,3),(s_id,e_dbglute,3,'15',60,4),(s_id,e_updownplank,3,'12',45,5);

-- ============================================================
-- PLAN 3: PLAN_H5 — Beginner at Home, 5 Days/Week
-- ============================================================
INSERT INTO workout_templates (coach_id, name, description, level, location, is_template)
VALUES (v_coach, 'Beginner at Home – 5 Days/Week', 'Full 5-day split across all 3 equipment phases', 'Beginner', 'Home', true)
RETURNING id INTO t_id;

INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 1: Bodyweights',      0, 1,  6) RETURNING id INTO p1;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 2: Resistance Bands', 1, 7,  12) RETURNING id INTO p2;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 3: Dumbbells',        2, 13, 18) RETURNING id INTO p3;

-- Phase 1 (5 days)
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 1 – Full Body Strength', 0, 'Arm circles, shoulder stretches (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,4,'15',60,0),(s_id,e_pushup,4,'10-15',60,1),(s_id,e_glutebridge,4,'15-20',60,2),
  (s_id,e_lunge,4,'12',60,3),(s_id,e_plank,3,'30-45 sec',45,4),(s_id,e_superman,3,'15-20',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 2 – Cardio & Core', 1, 'Dynamic stretches (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_highknees,4,'30 sec',30,0),(s_id,e_mountclimb,4,'20-30 sec',30,1),(s_id,e_russtwist,4,'20',45,2),
  (s_id,e_legraise,4,'15',45,3),(s_id,e_biccrnch,4,'20',45,4),(s_id,e_sideplank,3,'20-30 sec',30,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 3 – Lower Body & Balance', 2, 'Light dynamic stretching (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_calfbw,4,'20',45,0),(s_id,e_stepup,4,'12',60,1),(s_id,e_bwdeadlift,4,'12',60,2),
  (s_id,e_wallsit,4,'45 sec',45,3),(s_id,e_sidelunge,4,'10',60,4),(s_id,e_birddog,4,'12',45,5),(s_id,e_clamshell,3,'15',45,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 4 – Upper Body & Core', 3, 'Leg swings, arm swings, shoulder circles (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_pushup,4,'10-12',60,0),(s_id,e_tricdip,4,'12',60,1),(s_id,e_plankshldtap,4,'20',45,2),
  (s_id,e_biccrnch,4,'20',45,3),(s_id,e_sideplank,3,'10',45,4),(s_id,e_hollowbody,3,'20-30 sec',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 5 – Active Recovery & Flexibility', 4, 'Leg swings, arm swings, shoulder circles (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_deadbug,3,'15',45,0),(s_id,e_glutebridge,3,'15',45,1),(s_id,e_singlelegbal,3,'30 sec',30,2);

-- Phase 2 (5 days)
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p2, 'Day 1 – Full Body Strength', 5, 'Arm circles, leg swings, jog in place (5-6 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,3,'12-15',60,0),(s_id,e_pushup,3,'10-12',60,1),(s_id,e_bandrow,3,'12-15',60,2),
  (s_id,e_lunge,3,'12',60,3),(s_id,e_banddeadlift,3,'12',60,4),(s_id,e_plank,3,'30-45 sec',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p2, 'Day 2 – Core & Cardio', 6, 'Jumping jacks, high knees, arm swings (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_mountclimb,3,'30-45 sec',30,0),(s_id,e_biccrnch,3,'15',45,1),(s_id,e_russtwist,3,'20',45,2),
  (s_id,e_legraise,3,'12',45,3),(s_id,e_plankshldtap,3,'12',45,4),(s_id,e_burpee,3,'10-15',60,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p2, 'Day 3 – Lower Body', 7, 'High knees, arm circles, side twists (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,3,'15',60,0),(s_id,e_bandglute,3,'15',60,1),(s_id,e_stepup,3,'12',60,2),
  (s_id,e_bandlatwalks,3,'15',45,3),(s_id,e_calfraise,3,'20',45,4),(s_id,e_wallsit,3,'30-45 sec',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p2, 'Day 4 – Upper Body', 8, 'Leg swings, arm swings, shoulder circles (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bandchestprs,3,'12-15',60,0),(s_id,e_bandrow,3,'12-15',60,1),(s_id,e_bandshpress,3,'12-15',60,2),
  (s_id,e_bandbiccurl,3,'12-15',45,3),(s_id,e_tricdip,3,'10-12',45,4),(s_id,e_plankshldtap,3,'20',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p2, 'Day 5 – Mobility & Recovery', 9, null) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_deadbug,2,'15',30,0),(s_id,e_glutebridge,2,'15',30,1),(s_id,e_singlelegbal,2,'30 sec',30,2);

-- Phase 3 (5 days)
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p3, 'Day 1 – Upper Body Strength', 10, 'Arm circles, jumping jacks, shoulder taps (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_pushup,3,'10-12',60,0),(s_id,e_bandrow,3,'12-15',60,1),(s_id,e_dbshpress,3,'10-12',60,2),
  (s_id,e_bandbiccurl,3,'12-15',45,3),(s_id,e_tricdip,3,'10-12',45,4),(s_id,e_plankshldtap,3,'20',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p3, 'Day 2 – Lower Body Strength', 11, 'High knees, squats, glute bridges, leg swings (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,3,'15-20',60,0),(s_id,e_dblunge,3,'10',60,1),(s_id,e_banddeadlift,3,'12-15',60,2),
  (s_id,e_bandglute,3,'15',60,3),(s_id,e_calfraise,3,'15-20',45,4),(s_id,e_bandlegrise,3,'15',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p3, 'Day 3 – Core & Stability', 12, 'Jumping jacks, high knees, arm circles (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_plank,3,'45-60 sec',45,0),(s_id,e_russtwist,3,'20',45,1),(s_id,e_legraise,3,'12-15',45,2),
  (s_id,e_dbsidebend,3,'12',45,3),(s_id,e_biccrnch,3,'20',45,4),(s_id,e_mountclimb,3,'30 sec',30,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p3, 'Day 4 – Upper & Lower Combo', 13, 'High knees, arm circles, squats, lunges (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_dbsqtpress,3,'10-12',60,0),(s_id,e_pushup,3,'10',60,1),(s_id,e_bandrow,3,'12',60,2),
  (s_id,e_dbstepup,3,'10',60,3),(s_id,e_dbglute,3,'15',60,4),(s_id,e_updownplank,3,'12',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p3, 'Day 5 – Cardio & Functional', 14, 'Light jog, high knees, arm circles, lunges (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_burpee,3,'10',60,0),(s_id,e_dbdeadlift,3,'12',60,1),(s_id,e_bandlatwalks,3,'15',45,2),
  (s_id,e_mountclimb,3,'30-45 sec',30,3),(s_id,e_sidelunge,3,'10',60,4),(s_id,e_biccrnch,3,'20',45,5);

-- ============================================================
-- PLAN 4: PLAN_G3 — Beginner at Gym, 3 Days/Week
-- ============================================================
INSERT INTO workout_templates (coach_id, name, description, level, location, is_template)
VALUES (v_coach, 'Beginner at Gym – 3 Days/Week', 'Full body machine-based; ideal for complete gym newcomers', 'Beginner', 'Gym', true)
RETURNING id INTO t_id;

INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 1: Full Body', 0, 1, 6) RETURNING id INTO p1;

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 1 – Upper Body (Chest, Back, Shoulders)', 0, 'Arm circles and shoulder stretches (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,3,'12',90,0),(s_id,e_latpull,3,'12',90,1),(s_id,e_cablerow,3,'12',90,2),
  (s_id,e_dbshpress,3,'10-12',90,3),(s_id,e_bbcurl,3,'12',60,4),(s_id,e_triceppush,3,'12',60,5),(s_id,e_lateraise,3,'10',60,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 2 – Lower Body (Legs & Glutes)', 1, 'Leg swings, bodyweight squats (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_legpress,3,'12',90,0),(s_id,e_legext,3,'12',60,1),(s_id,e_legcurl,3,'12',60,2),
  (s_id,e_dblunge,3,'10',60,3),(s_id,e_glutebridge,3,'15',60,4),(s_id,e_calfraise,3,'15-20',45,5),(s_id,e_squat,3,'12',90,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 3 – Full Body & Core', 2, 'Light dynamic stretching (5-7 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,3,'12',90,0),(s_id,e_cablerow,3,'12',90,1),(s_id,e_pecdeck,3,'12',60,2),
  (s_id,e_dbshpress,3,'10-12',90,3),(s_id,e_russtwist,3,'20',45,4),(s_id,e_plank,3,'30-45 sec',45,5),(s_id,e_legraise,3,'15',45,6);

-- ============================================================
-- PLAN 5: PLAN_G4 — Beginner at Gym, 4 Days/Week
-- ============================================================
INSERT INTO workout_templates (coach_id, name, description, level, location, is_template)
VALUES (v_coach, 'Beginner at Gym – 4 Days/Week', 'Upper/Lower/Core/Full-body 4-day split', 'Beginner', 'Gym', true)
RETURNING id INTO t_id;

INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 1: Full Body', 0, 1, 6) RETURNING id INTO p1;

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 1 – Upper Body (Chest, Back, Shoulders)', 0, 'Arm circles and shoulder stretches (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,3,'12',90,0),(s_id,e_latpull,3,'12',90,1),(s_id,e_cablerow,3,'12',90,2),
  (s_id,e_dbshpress,3,'10-12',90,3),(s_id,e_bbcurl,3,'12',60,4),(s_id,e_triceppush,3,'12',60,5),(s_id,e_lateraise,3,'10',60,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 2 – Lower Body (Legs & Glutes)', 1, 'Leg swings, squats, dynamic stretches (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_legpress,3,'12',90,0),(s_id,e_legext,3,'12',60,1),(s_id,e_legcurl,3,'12',60,2),
  (s_id,e_dblunge,3,'10',60,3),(s_id,e_glutebridge,3,'15',60,4),(s_id,e_calfraise,3,'20',45,5),(s_id,e_squat,3,'12',90,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 3 – Core & Cardio', 2, 'High knees, arm circles, side twists (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_mountclimb,4,'30 sec',30,0),(s_id,e_russtwist,3,'20',45,1),(s_id,e_plank,3,'45-60 sec',45,2),
  (s_id,e_cablewoodchp,3,'12',60,3),(s_id,e_biccrnch,3,'20',45,4),(s_id,e_legraise,3,'15',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 4 – Full Body & Functional', 3, 'Arm circles, leg swings, shoulder rolls (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,3,'12',90,0),(s_id,e_cablerow,3,'12',90,1),(s_id,e_pecdeck,3,'12',60,2),
  (s_id,e_dbshpress,3,'10-12',90,3),(s_id,e_dblunge,3,'10',60,4),(s_id,e_calfraise,3,'15-20',45,5),(s_id,e_biccrnch,3,'15',45,6);

-- ============================================================
-- PLAN 6: PLAN_G5 — Beginner at Gym, 5 Days/Week
-- ============================================================
INSERT INTO workout_templates (coach_id, name, description, level, location, is_template)
VALUES (v_coach, 'Beginner at Gym – 5 Days/Week', 'Push/Pull/Legs + Back/Full-body 5-day split', 'Beginner', 'Gym', true)
RETURNING id INTO t_id;

INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 1: Full Body', 0, 1, 6) RETURNING id INTO p1;

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 1 – Upper Body (Chest, Shoulders, Triceps)', 0, 'Arm circles and shoulder stretches (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,3,'12',90,0),(s_id,e_incdb,3,'10-12',90,1),(s_id,e_dbshpress,3,'10-12',90,2),
  (s_id,e_lateraise,3,'10',60,3),(s_id,e_triceppush,3,'12',60,4),(s_id,e_dbfly,3,'10-12',60,5),(s_id,e_tricdip,3,'10-12',60,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 2 – Lower Body (Legs & Glutes)', 1, 'Leg swings, bodyweight squats (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_legpress,3,'12',90,0),(s_id,e_legext,3,'12',60,1),(s_id,e_legcurl,3,'12',60,2),
  (s_id,e_dblunge,3,'10',60,3),(s_id,e_glutebridge,3,'15',60,4),(s_id,e_calfraise,3,'15-20',45,5),(s_id,e_squat,3,'12',90,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 3 – Core & Cardio', 2, 'High knees, arm circles, side twists (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_mountclimb,4,'30 sec',30,0),(s_id,e_biccrnch,4,'20',45,1),(s_id,e_russtwist,3,'20',45,2),
  (s_id,e_cablewoodchp,3,'12',60,3),(s_id,e_plank,3,'45-60 sec',45,4),(s_id,e_legraise,3,'15',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 4 – Back & Biceps', 3, 'Light stretches for shoulders, arms, back (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_latpull,3,'12',90,0),(s_id,e_cablerow,3,'12',90,1),(s_id,e_bbcurl,3,'12',60,2),
  (s_id,e_hammer,3,'12',60,3),(s_id,e_facepull,3,'12',60,4),(s_id,e_superman,3,'12',45,5),(s_id,e_preacher,3,'10-12',60,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 5 – Full Body & Functional', 4, 'Arm swings, leg swings, bodyweight squats (5 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,3,'12',90,0),(s_id,e_incdb,3,'12',90,1),(s_id,e_cablerow,3,'12',90,2),
  (s_id,e_dblunge,3,'10',60,3),(s_id,e_calfraise,3,'15-20',45,4),(s_id,e_dbshpress,3,'10-12',90,5),(s_id,e_biccrnch,3,'15',45,6);

-- ============================================================
-- PLAN 7: PLAN_CG3 — Beginner at Community Gym, 3 Days/Week
-- ============================================================
INSERT INTO workout_templates (coach_id, name, description, level, location, is_template)
VALUES (v_coach, 'Beginner at Community Gym – 3 Days/Week', 'Machine-focused 55-min sessions; Upper/Lower/Circuit', 'Beginner', 'Community Gym', true)
RETURNING id INTO t_id;

INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 1', 0, 1, 12) RETURNING id INTO p1;

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 1 – Upper Body Focus + Core', 0, 'Treadmill incline walk or rowing machine; dynamic arm circles, shoulder mobility (10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,4,'10',90,0),(s_id,e_dbshpress,3,'10',90,1),(s_id,e_pecdeck,3,'12',60,2),
  (s_id,e_triceppush,3,'12',60,3),(s_id,e_lateraise,3,'12',60,4),(s_id,e_plankshldtap,3,'30 sec',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 2 – Lower Body + Glutes', 1, 'Stair climber or elliptical; glute activation – banded glute bridges, leg swings (10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_legpress,4,'10',90,0),(s_id,e_bsquat,3,'10',90,1),(s_id,e_legcurl,3,'12',60,2),
  (s_id,e_hipthrust,3,'12',60,3),(s_id,e_calfraise,3,'15',45,4),(s_id,e_russtwist,3,'15',45,5),(s_id,e_cablecrunch,3,'15',45,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 3 – Full-Body Circuit + Cardio', 2, 'Rowing machine or light jog; full-body mobility drills (10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_latpull,3,'10',90,0),(s_id,e_squat,3,'12',90,1),(s_id,e_cablerow,3,'10',90,2),
  (s_id,e_lunge,3,'10',60,3),(s_id,e_hangleg,3,'15',45,4),(s_id,e_biccrnch,3,'20',45,5);

-- ============================================================
-- PLAN 8: PLAN_CG4 — Beginner at Community Gym, 4 Days/Week
-- ============================================================
INSERT INTO workout_templates (coach_id, name, description, level, location, is_template)
VALUES (v_coach, 'Beginner at Community Gym – 4 Days/Week', 'Upper/Lower 4-day split; 55-min structured sessions', 'Beginner', 'Community Gym', true)
RETURNING id INTO t_id;

INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 1', 0, 1, 12) RETURNING id INTO p1;

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 1 – Upper Body (Chest, Shoulders, Triceps)', 0, 'Rowing or elliptical; shoulder mobility (10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,4,'12',90,0),(s_id,e_dbshpress,3,'12',90,1),(s_id,e_pecdeck,3,'12',60,2),
  (s_id,e_lateraise,3,'12',60,3),(s_id,e_triceppush,3,'12',60,4),(s_id,e_plank,3,'30 sec',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 2 – Lower Body Strength & Power', 1, 'Stair climber or incline walk; glute activation (10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_legpress,4,'8-10',90,0),(s_id,e_bsquat,3,'10',90,1),(s_id,e_legcurl,3,'12',60,2),
  (s_id,e_hipthrust,3,'12',60,3),(s_id,e_calfraise,3,'15',45,4),(s_id,e_dbsidebend,3,'15',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 3 – Upper Body (Back, Biceps, Core)', 2, 'Rowing machine; arm swings, shoulder mobility (10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_latpull,4,'12',90,0),(s_id,e_cablerow,3,'12',90,1),(s_id,e_lateraise,3,'12',60,2),
  (s_id,e_bbcurl,3,'12',60,3),(s_id,e_hammer,3,'12',60,4),(s_id,e_facepull,3,'12',60,5),(s_id,e_russtwist,3,'15',45,6);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order, warmup_notes) VALUES (t_id, p1, 'Day 4 – Lower Body Endurance & Functional', 3, 'Stair climber or cycling; glute activation (10 min)') RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_legcurl,4,'12',60,0),(s_id,e_legpress,3,'15',90,1),(s_id,e_dbstepup,3,'12',60,2),
  (s_id,e_hipthrust,3,'12',60,3),(s_id,e_calfraise,3,'15',45,4),(s_id,e_hangleg,3,'12',45,5);

-- ============================================================
-- PLAN 9: PLAN_IG3 — Intermediate at Gym, 3 Days/Week, 4 Phases
-- ============================================================
INSERT INTO workout_templates (coach_id, name, description, level, location, is_template)
VALUES (v_coach, 'Intermediate at Gym – 3 Days/Week', '4-phase: Foundation → Hypertrophy → Power → Advanced Size', 'Intermediate', 'Gym', true)
RETURNING id INTO t_id;

INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 1: Foundation & Strength',          0, 1,  6) RETURNING id INTO p1;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 2: Hypertrophy & Muscle Growth',     1, 7,  12) RETURNING id INTO p2;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 3: Strength & Power',                2, 13, 18) RETURNING id INTO p3;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 4: Advanced Hypertrophy & Strength', 3, 19, 24) RETURNING id INTO p4;

-- Phase 1
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p1, 'Day 1 – Full Body Strength', 0) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,4,'6-8',120,0),(s_id,e_bench,4,'6-8',120,1),(s_id,e_barbellrow,4,'8',90,2),
  (s_id,e_ohpress,3,'8',90,3),(s_id,e_plank,3,'45 sec',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p1, 'Day 2 – Lower Body Focus', 1) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_deadlift,4,'6-8',120,0),(s_id,e_bsquat,3,'10',90,1),(s_id,e_rdl,3,'10',90,2),
  (s_id,e_legpress,3,'12',60,3),(s_id,e_calfraise,3,'15',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p1, 'Day 3 – Upper Body Focus', 2) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_inclinedbprs,4,'8-10',90,0),(s_id,e_pullup,4,'6-8',90,1),(s_id,e_dbrow,3,'10',90,2),
  (s_id,e_dbshpress,3,'10',90,3),(s_id,e_hangleg,3,'12',45,4);

-- Phase 2
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p2, 'Day 1 – Full Body Volume', 3) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,4,'10-12',90,0),(s_id,e_bench,4,'12',90,1),(s_id,e_latpull,4,'12-15',60,2),
  (s_id,e_dbshpress,3,'12',60,3),(s_id,e_plankshldtap,3,'12',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p2, 'Day 2 – Lower Body Volume', 4) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_legpress,4,'12-15',90,0),(s_id,e_rdl,4,'12',90,1),(s_id,e_walklunge,3,'15',60,2),
  (s_id,e_hipthrust,3,'12',60,3),(s_id,e_calfraise,4,'20',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p2, 'Day 3 – Upper Body Volume', 5) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_incdb,4,'12-15',90,0),(s_id,e_cablerow,4,'12',90,1),(s_id,e_arnoldpress,3,'12',60,2),
  (s_id,e_bbcurl,3,'15',60,3),(s_id,e_triceppush,3,'15',60,4),(s_id,e_russtwist,3,'20',45,5);

-- Phase 3
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p3, 'Day 1 – Full Body Power', 6) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,5,'5',180,0),(s_id,e_bench,5,'5',180,1),(s_id,e_barbellrow,4,'6',120,2),
  (s_id,e_pushpress,4,'6',120,3),(s_id,e_wgtplank,3,'45 sec',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p3, 'Day 2 – Lower Body Power', 7) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_deadlift,5,'5',180,0),(s_id,e_boxsquat,4,'6',120,1),(s_id,e_bsquat,4,'8',90,2),
  (s_id,e_wgtstep,3,'10',60,3),(s_id,e_calfraise,4,'15',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p3, 'Day 3 – Upper Body Power', 8) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_inclinedbprs,5,'5',180,0),(s_id,e_wgtpullup,4,'6-8',120,1),(s_id,e_dbrow,4,'8-10',90,2),
  (s_id,e_ohpress,4,'6',120,3),(s_id,e_hangleg,3,'12',45,4);

-- Phase 4
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p4, 'Day 1 – Full Body Strength & Size', 9) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,4,'6-8',120,0),(s_id,e_bench,4,'6-8',120,1),(s_id,e_tbarrow,4,'8-10',90,2),
  (s_id,e_dbshpress,3,'10',90,3),(s_id,e_plank,3,'60 sec',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p4, 'Day 2 – Lower Body Strength & Size', 10) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_deadlift,4,'6-8',120,0),(s_id,e_hacksquat,4,'10-12',90,1),(s_id,e_rdl,3,'12',90,2),
  (s_id,e_legpress,3,'12-15',60,3),(s_id,e_calfraise,4,'20',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p4, 'Day 3 – Upper Body Strength & Size', 11) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_inclinedbprs,4,'8-10',90,0),(s_id,e_wgtpullup,4,'8',90,1),(s_id,e_dbrow,4,'10',90,2),
  (s_id,e_dbshpress,3,'10-12',90,3),(s_id,e_wgtrustwist,3,'15',45,4);

-- ============================================================
-- PLAN 10: PLAN_IG4 — Intermediate at Gym, 4 Days/Week, 4 Phases
-- ============================================================
INSERT INTO workout_templates (coach_id, name, description, level, location, is_template)
VALUES (v_coach, 'Intermediate at Gym – 4 Days/Week', 'Upper/Lower 4-day with 4 progressive phases', 'Intermediate', 'Gym', true)
RETURNING id INTO t_id;

INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 1: Foundation & Strength',          0, 1,  6) RETURNING id INTO p1;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 2: Hypertrophy & Muscle Growth',     1, 7,  12) RETURNING id INTO p2;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 3: Strength & Power',                2, 13, 18) RETURNING id INTO p3;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 4: Advanced Hypertrophy & Strength', 3, 19, 24) RETURNING id INTO p4;

-- Phase 1
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p1, 'Day 1 – Upper Body Strength', 0) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,4,'6-8',120,0),(s_id,e_barbellrow,4,'8-10',90,1),(s_id,e_ohpress,4,'8',90,2),
  (s_id,e_pullup,3,'8',90,3),(s_id,e_bbcurl,3,'12',60,4),(s_id,e_plank,3,'45 sec',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p1, 'Day 2 – Lower Body Strength', 1) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,4,'6-8',120,0),(s_id,e_deadlift,4,'5-6',180,1),(s_id,e_legpress,3,'10',90,2),
  (s_id,e_bsquat,3,'10',90,3),(s_id,e_calfraise,4,'12-15',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p1, 'Day 3 – Upper Body Assistance', 2) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_incdb,4,'8-10',90,0),(s_id,e_latpull,4,'10',90,1),(s_id,e_dbrow,4,'8-10',90,2),
  (s_id,e_dbshpress,3,'10',90,3),(s_id,e_tricdip,3,'12',60,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p1, 'Day 4 – Lower Body Assistance', 3) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_frontsquat,4,'8-10',90,0),(s_id,e_rdl,4,'8-10',90,1),(s_id,e_walklunge,3,'12',60,2),
  (s_id,e_glutebridge,3,'12',60,3),(s_id,e_calfraise,4,'15-20',45,4);

-- Phase 2
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p2, 'Day 1 – Upper Body Hypertrophy', 4) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,4,'10-12',90,0),(s_id,e_incdb,4,'12-15',90,1),(s_id,e_latpull,4,'12-15',90,2),
  (s_id,e_dbshpress,3,'12',60,3),(s_id,e_bbcurl,3,'15',60,4),(s_id,e_plankshldtap,3,'12',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p2, 'Day 2 – Lower Body Hypertrophy', 5) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,4,'10-12',90,0),(s_id,e_legpress,4,'12-15',90,1),(s_id,e_rdl,4,'12',90,2),
  (s_id,e_hipthrust,3,'12',60,3),(s_id,e_calfraise,4,'20',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p2, 'Day 3 – Upper Body Assistance', 6) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_ohpress,4,'10-12',90,0),(s_id,e_dbrow,4,'12-15',90,1),(s_id,e_cablefly,3,'15',60,2),
  (s_id,e_facepull,3,'15',60,3),(s_id,e_hammer,3,'15',60,4),(s_id,e_hangleg,3,'12',45,5);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p2, 'Day 4 – Lower Body Assistance', 7) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_frontsquat,4,'10-12',90,0),(s_id,e_splitlunge,3,'12',60,1),(s_id,e_legext,3,'15',60,2),
  (s_id,e_legcurl,3,'15',60,3),(s_id,e_calfraise,4,'20',45,4);

-- Phase 3
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p3, 'Day 1 – Upper Body Power', 8) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,5,'5',180,0),(s_id,e_wgtpullup,4,'6-8',120,1),(s_id,e_ohpress,5,'5',180,2),
  (s_id,e_dbrow,4,'6-8',90,3),(s_id,e_wgtplank,3,'60 sec',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p3, 'Day 2 – Lower Body Power', 9) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_deadlift,5,'5',180,0),(s_id,e_squat,5,'5',180,1),(s_id,e_bsquat,4,'8',90,2),
  (s_id,e_glutebridge,3,'8-10',90,3),(s_id,e_calfraise,4,'12-15',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p3, 'Day 3 – Upper Body Strength', 10) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_inclinedbprs,4,'6-8',120,0),(s_id,e_dbshpress,4,'8-10',90,1),(s_id,e_barbellrow,4,'6-8',120,2),
  (s_id,e_facepull,3,'12',60,3),(s_id,e_hangleg,3,'12',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p3, 'Day 4 – Lower Body Strength', 11) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_frontsquat,4,'6-8',120,0),(s_id,e_rdl,4,'8-10',90,1),(s_id,e_wgtstep,3,'10',60,2),
  (s_id,e_legpress,3,'10-12',90,3),(s_id,e_calfraise,4,'15',45,4);

-- Phase 4
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p4, 'Day 1 – Upper Body Strength & Size', 12) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,4,'6-8',120,0),(s_id,e_dbrow,4,'8-10',90,1),(s_id,e_dbfly,3,'12',60,2),
  (s_id,e_dbshpress,4,'8-10',90,3),(s_id,e_wgtplank,3,'60 sec',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p4, 'Day 2 – Lower Body Strength & Size', 13) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,4,'6-8',120,0),(s_id,e_rdl,4,'8-10',90,1),(s_id,e_walklunge,3,'12',60,2),
  (s_id,e_hipthrust,3,'10-12',60,3),(s_id,e_calfraise,4,'20',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p4, 'Day 3 – Upper Body Assistance', 14) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_inclinedbprs,4,'8-10',90,0),(s_id,e_wgtpullup,4,'8',90,1),(s_id,e_dbshpress,3,'12',60,2),
  (s_id,e_cablerow,3,'12-15',60,3),(s_id,e_hangleg,3,'15',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p4, 'Day 4 – Lower Body Assistance', 15) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_frontsquat,4,'8-10',90,0),(s_id,e_legpress,4,'12',90,1),(s_id,e_legcurl,3,'12-15',60,2),
  (s_id,e_splitlunge,3,'10',60,3),(s_id,e_calfraise,4,'20',45,4);

-- ============================================================
-- PLAN 11: PLAN_IG5 — Intermediate at Gym, 5 Days/Week, 4 Phases
-- ============================================================
INSERT INTO workout_templates (coach_id, name, description, level, location, is_template)
VALUES (v_coach, 'Intermediate at Gym – 5 Days/Week', 'Push/Pull/Legs 5-day with 4 phases (most complete program)', 'Intermediate', 'Gym', true)
RETURNING id INTO t_id;

INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 1: Foundation & Strength',          0, 1,  6) RETURNING id INTO p1;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 2: Hypertrophy & Muscle Growth',     1, 7,  12) RETURNING id INTO p2;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 3: Strength & Power',                2, 13, 18) RETURNING id INTO p3;
INSERT INTO workout_template_phases (template_id, name, sort_order, week_start, week_end) VALUES (t_id, 'Phase 4: Advanced Hypertrophy & Strength', 3, 19, 24) RETURNING id INTO p4;

-- Phase 1 (5 days)
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p1, 'Day 1 – Push (Chest, Shoulders, Triceps)', 0) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,4,'6-8',120,0),(s_id,e_ohpress,4,'6-8',120,1),(s_id,e_incdb,3,'10',90,2),
  (s_id,e_lateraise,3,'12',60,3),(s_id,e_triceppush,3,'12',60,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p1, 'Day 2 – Pull (Back, Biceps)', 1) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_deadlift,4,'6',180,0),(s_id,e_barbellrow,4,'8-10',90,1),(s_id,e_latpull,3,'10-12',90,2),
  (s_id,e_cablerow,3,'12',60,3),(s_id,e_bbcurl,3,'12',60,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p1, 'Day 3 – Legs', 2) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,4,'6-8',120,0),(s_id,e_rdl,4,'8-10',90,1),(s_id,e_legpress,3,'12',90,2),
  (s_id,e_walklunge,3,'12',60,3),(s_id,e_calfraise,4,'15',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p1, 'Day 4 – Upper Body Strength', 3) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_inclinedbprs,4,'8-10',90,0),(s_id,e_pullup,4,'8',90,1),(s_id,e_dbrow,3,'10',90,2),
  (s_id,e_arnoldpress,3,'12',60,3),(s_id,e_bbcurl,3,'12',60,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p1, 'Day 5 – Lower Body Strength', 4) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_frontsquat,4,'8',90,0),(s_id,e_bsquat,3,'10',90,1),(s_id,e_hipthrust,3,'10',60,2),
  (s_id,e_legext,3,'12-15',60,3),(s_id,e_calfraise,4,'20',45,4);

-- Phase 2 (5 days)
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p2, 'Day 1 – Push (Chest, Shoulders, Triceps)', 5) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,4,'10-12',90,0),(s_id,e_dbfly,3,'12-15',60,1),(s_id,e_dbshpress,4,'12',90,2),
  (s_id,e_lateraise,3,'15',60,3),(s_id,e_tricdip,3,'12-15',60,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p2, 'Day 2 – Pull (Back, Biceps)', 6) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_barbellrow,4,'10-12',90,0),(s_id,e_pullup,4,'8-10',90,1),(s_id,e_dbrow,3,'12',90,2),
  (s_id,e_facepull,3,'15',60,3),(s_id,e_hammer,3,'12-15',60,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p2, 'Day 3 – Legs', 7) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,4,'10-12',90,0),(s_id,e_rdl,4,'12',90,1),(s_id,e_legpress,4,'12-15',90,2),
  (s_id,e_splitlunge,3,'12',60,3),(s_id,e_calfraise,4,'20',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p2, 'Day 4 – Upper Body Volume', 8) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_inclinedbprs,4,'10-12',90,0),(s_id,e_cablerow,4,'12',90,1),(s_id,e_dbshpress,3,'12-15',60,2),
  (s_id,e_latpull,3,'12',90,3),(s_id,e_bbcurl,3,'15',60,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p2, 'Day 5 – Lower Body Volume', 9) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_hacksquat,4,'12',90,0),(s_id,e_hipthrust,4,'12',60,1),(s_id,e_legext,3,'15',60,2),
  (s_id,e_legcurl,3,'15',60,3),(s_id,e_calfraise,4,'20',45,4);

-- Phase 3 (5 days)
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p3, 'Day 1 – Push Power', 10) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,5,'5',180,0),(s_id,e_ohpress,5,'5',180,1),(s_id,e_inclinedbprs,4,'6',120,2),
  (s_id,e_tricdip,3,'8',90,3),(s_id,e_dbfly,3,'10',60,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p3, 'Day 2 – Pull Power', 11) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_deadlift,5,'5',180,0),(s_id,e_wgtpullup,4,'6-8',120,1),(s_id,e_tbarrow,4,'8',90,2),
  (s_id,e_facepull,3,'10',60,3),(s_id,e_bbcurl,3,'12',60,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p3, 'Day 3 – Leg Power', 12) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,5,'5',180,0),(s_id,e_frontsquat,4,'6-8',120,1),(s_id,e_rdl,4,'8',90,2),
  (s_id,e_wgtstep,3,'10',60,3),(s_id,e_calfraise,4,'15',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p3, 'Day 4 – Upper Body Strength', 13) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_inclinedbprs,5,'6',120,0),(s_id,e_barbellrow,4,'6-8',120,1),(s_id,e_dbshpress,4,'8-10',90,2),
  (s_id,e_latpull,3,'8-10',90,3),(s_id,e_plank,3,'60 sec',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p3, 'Day 5 – Lower Body Strength', 14) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_deadlift,5,'5',180,0),(s_id,e_legpress,4,'8-10',90,1),(s_id,e_bsquat,4,'8',90,2),
  (s_id,e_hipthrust,4,'8-10',60,3),(s_id,e_calfraise,4,'12',45,4);

-- Phase 4 (5 days)
INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p4, 'Day 1 – Push Strength & Size', 15) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_bench,4,'6-8',120,0),(s_id,e_dbshpress,4,'8-10',90,1),(s_id,e_incdb,3,'10',90,2),
  (s_id,e_cablefly,3,'12',60,3),(s_id,e_triceppush,3,'15',60,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p4, 'Day 2 – Pull Strength & Size', 16) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_deadlift,4,'6-8',120,0),(s_id,e_barbellrow,4,'8-10',90,1),(s_id,e_latpull,4,'10-12',90,2),
  (s_id,e_bbcurl,3,'12',60,3),(s_id,e_hammer,3,'12-15',60,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p4, 'Day 3 – Legs Strength & Size', 17) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_squat,4,'6-8',120,0),(s_id,e_rdl,4,'8-10',90,1),(s_id,e_legpress,4,'12',90,2),
  (s_id,e_walklunge,3,'12',60,3),(s_id,e_calfraise,4,'20',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p4, 'Day 4 – Upper Body Assistance', 18) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_inclinedbprs,4,'8-10',90,0),(s_id,e_dbrow,4,'10',90,1),(s_id,e_arnoldpress,3,'12',60,2),
  (s_id,e_facepull,3,'15',60,3),(s_id,e_hangleg,3,'12',45,4);

INSERT INTO workout_template_slots (template_id, phase_id, name, sort_order) VALUES (t_id, p4, 'Day 5 – Lower Body Assistance', 19) RETURNING id INTO s_id;
INSERT INTO workout_slot_exercises (slot_id, exercise_id, sets, reps, rest_seconds, sort_order) VALUES
  (s_id,e_frontsquat,4,'8-10',90,0),(s_id,e_legext,3,'12-15',60,1),(s_id,e_hipthrust,4,'10-12',60,2),
  (s_id,e_calfraise,4,'20',45,3),(s_id,e_wgtplank,3,'60 sec',45,4);

END $$;
