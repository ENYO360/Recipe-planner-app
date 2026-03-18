// src/database/mealPlanRepository.js
import { getDb } from "./db";

// ── READ all meal plan entries ────────────────────────────────────────────────
export async function getAllMealPlan() {
  const db = await getDb();
  const rows = await db.getAllAsync(`SELECT * FROM meal_plan`);

  // Convert flat rows into our nested { dateKey: { breakfast, lunch, dinner } } shape
  const plan = {};
  for (const row of rows) {
    if (!plan[row.date_key]) {
      plan[row.date_key] = { breakfast: null, lunch: null, dinner: null };
    }
    plan[row.date_key][row.meal_type] = {
      id:       row.recipe_id,
      title:    row.recipe_title,
      image:    row.recipe_image,
      duration: row.recipe_duration,
    };
  }
  return plan;
}

// ── ASSIGN a recipe to a meal slot ────────────────────────────────────────────
// INSERT OR REPLACE handles the UNIQUE(date_key, meal_type) constraint —
// if a slot already has a recipe it gets replaced automatically
export async function assignMealInDb(dateKey, mealType, recipe) {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO meal_plan
      (id, date_key, meal_type, recipe_id, recipe_title, recipe_image, recipe_duration)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      `${dateKey}-${mealType}`,  // deterministic id
      dateKey,
      mealType,
      recipe.id,
      recipe.title,
      recipe.image,
      recipe.duration,
    ]
  );
}

// ── REMOVE a recipe from a meal slot ─────────────────────────────────────────
export async function removeMealFromDb(dateKey, mealType) {
  const db = await getDb();
  await db.runAsync(
    `DELETE FROM meal_plan WHERE date_key = ? AND meal_type = ?`,
    [dateKey, mealType]
  );
}