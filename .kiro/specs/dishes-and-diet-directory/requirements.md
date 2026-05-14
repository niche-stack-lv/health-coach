# Requirements Document

## Introduction

This feature introduces a structured Dishes Directory, a Diet Directory built on top of it, and a Daily Food Check-in system for the FitCoach platform. Currently, diet plans store food items as flat string arrays with no concept of composite dishes, meal component categories, or food logging during check-ins. This feature replaces the unstructured approach with a layered system: individual food items compose into dishes, dishes compose into meal slots within 7-day diet plans, and clients log their actual food intake by selecting from plan-prescribed dishes and their component alternatives.

## Glossary

- **Dish**: A pre-defined recipe composed of one or more Food_Items with specific quantities, having a calculated macro breakdown and a component category tag
- **Food_Item**: An individual ingredient from the food database with per-100g macro values
- **Component_Category**: A classification for a dish indicating its nutritional role within a meal slot — one of carbohydrate, protein, fiber, or complete_meal
- **Diet_Directory**: A collection of 7-day weekly diet plan templates that reference dishes from the Dishes_Directory
- **Diet_Plan_Template**: A named 7-day structure defining meal slots per day, each slot containing prescribed dishes organized by component category. Days 1-7 map to Sunday-Saturday.
- **Plan_Type**: A classification for a diet plan template — one of veg, nonveg, low_carb_nonveg, or intermittent_fasting
- **Meal_Slot**: A named eating occasion within a day (e.g., Breakfast, Lunch, Snack, Dinner) with a target calorie range
- **Meal_Component**: A specific component category position within a meal slot (e.g., the carbohydrate source for Lunch)
- **Alternative**: One of multiple dish options a client can choose from within a single meal component
- **Daily_Food_Check_In**: A daily record of what a client actually ate, structured by meal slots and component selections
- **Template_Assignment**: A one-time link between a diet plan template and a client. A client has at most one active assignment at a time. The coach can manually swap or remove it.
- **Coach**: The admin user who manages clients, creates dishes, and builds diet plan templates
- **Client**: A person receiving coaching who views their assigned diet plan and logs daily food intake
- **Platform**: The FitCoach white-label fitness coaching application

## Requirements

### Requirement 1: Create a Dish

**User Story:** As a Coach, I want to create dishes composed of multiple food items with specific quantities, so that I can build a reusable library of recipes for diet plans.

#### Acceptance Criteria

1. WHEN the Coach submits a new dish with a name, component category, and at least one food item with a gram amount, THE Platform SHALL create the dish in the Dishes_Directory and calculate its total macros (calories, protein, carbs, fat) from the constituent food items.
2. THE Platform SHALL require each dish to have exactly one component category tag from: carbohydrate, protein, fiber, or complete_meal.
3. WHEN the Coach adds a food item to a dish, THE Platform SHALL calculate the macro contribution of that food item based on its per-100g values and the specified gram amount.
4. THE Platform SHALL compute the total macros of a dish as the sum of macro contributions from all constituent food items.
5. IF the Coach submits a dish without a name or without at least one food item, THEN THE Platform SHALL display a validation error and prevent creation.
6. WHEN the Coach creates a dish with a component category of complete_meal, THE Platform SHALL allow the dish to contain food items from any food database category.

### Requirement 2: Manage the Dishes Directory

**User Story:** As a Coach, I want to browse, edit, and delete dishes in my directory, so that I can maintain an accurate and up-to-date library of recipes.

#### Acceptance Criteria

1. WHEN the Coach navigates to the Dishes Directory page, THE Platform SHALL display all dishes grouped by component category with their names, emoji indicators, and total macro summaries.
2. WHEN the Coach edits a dish by changing its food items or quantities, THE Platform SHALL recalculate the total macros and persist the updated dish.
3. WHEN the Coach deletes a dish that is not referenced by any active diet plan template, THE Platform SHALL remove the dish from the directory.
4. IF the Coach attempts to delete a dish that is referenced by an active diet plan template, THEN THE Platform SHALL display a warning indicating which templates reference the dish and prevent deletion.
5. WHEN the Coach searches or filters dishes by name or component category, THE Platform SHALL display only matching dishes within 300ms of input.

### Requirement 3: Create a Diet Plan Template

**User Story:** As a Coach, I want to create 7-day diet plan templates that reference dishes from my directory, so that I can assign structured weekly meal plans to clients.

#### Acceptance Criteria

1. WHEN the Coach creates a new diet plan template, THE Platform SHALL require a name, a plan type, and a 7-day structure with configurable meal slots per day.
2. THE Platform SHALL allow each day to have between 1 and 6 meal slots, each with a name and an optional target calorie value.
3. WHEN the Coach assigns a dish to a meal component within a meal slot, THE Platform SHALL validate that the dish component category matches the meal component position (e.g., a protein-tagged dish in the protein component position).
4. THE Platform SHALL allow multiple alternative dishes within a single meal component, enabling the client to choose between options.
5. WHEN all 7 days of a template have at least one meal slot with at least one dish assigned, THE Platform SHALL allow the template to be saved.
6. THE Platform SHALL support the following plan types: veg, nonveg, low_carb_nonveg, and intermittent_fasting.
7. WHEN the plan type is intermittent_fasting, THE Platform SHALL allow a meal slot to be marked as skipped for specific days without requiring dish assignments.

### Requirement 4: View Diet Plan Template (Weekly Overview)

**User Story:** As a Coach or Client, I want to see the full 7-day weekly view of a diet plan template, so that I can understand the complete meal structure at a glance.

#### Acceptance Criteria

1. WHEN a user navigates to a diet plan template view, THE Platform SHALL display all 7 days (Sunday through Saturday) with their meal slots, showing each slot's dishes organized by component category (carbohydrate, protein, fiber).
2. THE Platform SHALL display the dish name, its total macros, and the component category for each dish within a meal slot.
3. WHERE a meal component has multiple alternatives, THE Platform SHALL display all alternatives with a visual indicator that the client can choose one.
4. THE Platform SHALL display daily macro totals (sum of all meal slot macros) for each day.
5. THE Platform SHALL display the target calorie value for each meal slot alongside the actual calculated calories from assigned dishes.

### Requirement 5: Assign a Diet Plan Template to a Client

**User Story:** As a Coach, I want to assign a diet plan template to a client, so that the client can follow the prescribed weekly meal structure.

#### Acceptance Criteria

1. WHEN the Coach assigns a diet plan template to a client, THE Platform SHALL create an active assignment linking the template to the client.
2. THE Platform SHALL ensure a client has at most one active assignment at a time. If the client already has an active assignment, the coach must deactivate it before assigning a new one (or the system deactivates the old one automatically on new assignment).
3. WHEN a diet plan is assigned, THE Platform SHALL make the full weekly view available to the client on their plan page, with days 1-7 mapping to Sunday through Saturday.

### Requirement 6: Daily Food Check-In — Meal Logging

**User Story:** As a Client, I want to log what I actually ate each day by selecting dishes from my assigned plan, so that my coach can track my adherence to the diet.

#### Acceptance Criteria

1. WHEN a Client opens the daily food check-in, THE Platform SHALL display the meal slots for the current day of the week (e.g., Monday shows Day 2) according to their active assigned diet plan template.
2. FOR each meal slot, THE Platform SHALL display the prescribed meal components (carbohydrate, protein, fiber) with their alternative dish options as selectable choices.
3. WHEN the Client selects a dish for a meal component, THE Platform SHALL record that selection as part of the daily food check-in.
4. THE Platform SHALL allow the Client to mark a meal slot as skipped if they did not eat that meal.
5. WHEN the Client submits the daily food check-in, THE Platform SHALL persist all meal component selections and calculate the total macros consumed for that day.
6. IF the Client has not submitted a check-in for the current day, THEN THE Platform SHALL display a reminder on the client home page.

### Requirement 7: Daily Food Check-In — Adherence Tracking

**User Story:** As a Coach, I want to see how closely clients follow their prescribed diet plans, so that I can provide targeted feedback and adjustments.

#### Acceptance Criteria

1. WHEN the Coach views a client's check-in history, THE Platform SHALL display daily food check-ins alongside the prescribed plan for comparison.
2. THE Platform SHALL calculate a daily adherence score as the percentage of meal components where the client selected one of the prescribed alternatives.
3. WHEN a Client marks a meal slot as skipped, THE Platform SHALL count that slot as non-adherent in the adherence score calculation unless the plan type is intermittent_fasting and the slot is marked as skipped in the template.
4. THE Platform SHALL display a weekly adherence summary showing the average daily adherence score for the past 7 days.

### Requirement 8: Dish Macro Calculation Integrity

**User Story:** As a Coach, I want dish macros to always reflect the current food item data and quantities, so that diet plans show accurate nutritional information.

#### Acceptance Criteria

1. THE Platform SHALL calculate dish macros using the formula: for each food item, (gram_amount / 100) multiplied by the per-100g macro value, summed across all food items in the dish.
2. WHEN a food item's per-100g values are updated in the food database, THE Platform SHALL recalculate macros for all dishes containing that food item.
3. THE Platform SHALL round all displayed macro values to the nearest whole number.
4. FOR ALL valid dishes, calculating macros from constituent food items and then summing component macros within a meal slot SHALL produce the same result as summing individual food item contributions directly (associativity property).

### Requirement 9: Support for Custom Food Items in Dishes

**User Story:** As a Coach, I want to add custom food items with manually entered macros when building a dish, so that I can include ingredients not in the standard food database.

#### Acceptance Criteria

1. WHEN the Coach adds a custom food item to a dish with a name, gram amount, and manually entered per-100g macros, THE Platform SHALL include that item in the dish macro calculation.
2. THE Platform SHALL store custom food items as part of the dish definition, not in the shared food database.
3. THE Platform SHALL visually distinguish custom food items from standard food database items within a dish.
