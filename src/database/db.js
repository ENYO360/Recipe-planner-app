import * as SQLite from "expo-sqlite";
import { SAMPLE_RECIPES } from "../data/sampleRecipes";

let db = null;

export async function getDb() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync("recipe_planner.db");
  return db;
}

export async function initDatabase() {
  const database = await getDb();

  await database.execAsync(`PRAGMA foreign_keys = ON;`);

  // ── Create all tables
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id           TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      category     TEXT NOT NULL,
      difficulty   TEXT NOT NULL,
      duration     TEXT NOT NULL,
      servings     INTEGER NOT NULL DEFAULT 2,
      description  TEXT,
      image        TEXT,
      is_favourite INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id         TEXT PRIMARY KEY,
      recipe_id  TEXT NOT NULL,
      name       TEXT NOT NULL,
      amount     REAL NOT NULL DEFAULT 1,
      unit       TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS steps (
      id         TEXT PRIMARY KEY,
      recipe_id  TEXT NOT NULL,
      step_text  TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meal_plan (
      id              TEXT PRIMARY KEY,
      date_key        TEXT NOT NULL,
      meal_type       TEXT NOT NULL,
      recipe_id       TEXT NOT NULL,
      recipe_title    TEXT NOT NULL,
      recipe_image    TEXT,
      recipe_duration TEXT,
      UNIQUE(date_key, meal_type)
    );

    CREATE TABLE IF NOT EXISTS shopping_list (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      amount     REAL DEFAULT 0,
      unit       TEXT DEFAULT '',
      checked    INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── Migration system
  // user_version tracks which seed/migration has run.
  // Bump TARGET_VERSION whenever sample data changes.
  const TARGET_VERSION = 4;
  const { user_version } = await database.getFirstAsync(`PRAGMA user_version`);

  if (user_version < TARGET_VERSION) {
    await migrateTo(database, TARGET_VERSION);
  }
}

async function migrateTo(database, version) {
  console.log(`[DB] Migrating to version ${version}...`);
  const currentSampleIds = SAMPLE_RECIPES.map((r) => r.id);

  // Old sample IDs from earlier versions of the app (ids "1"–"5")
  const legacyIds = ["1", "2", "3", "4", "5"];

  const allIdsToWipe = [...new Set([...currentSampleIds, ...legacyIds])];

  await database.withTransactionAsync(async () => {
    for (const id of allIdsToWipe) {
      // CASCADE automatically removes ingredients + steps for this recipe
      await database.runAsync(`DELETE FROM recipes WHERE id = ?`, [id]);
    }
  });

  // ── Step 2: Re-seed with current sample data 
  await seedSampleData(database);

  // ── Step 3: Mark migration complete
  await database.execAsync(`PRAGMA user_version = ${version}`);

  console.log(`[DB] Migration to version ${version} complete.`);
}

async function seedSampleData(database) {
  await database.withTransactionAsync(async () => {
    for (const recipe of SAMPLE_RECIPES) {
      // INSERT OR REPLACE so if somehow a row exists it gets refreshed
      await database.runAsync(
        `INSERT OR REPLACE INTO recipes
          (id, title, category, difficulty, duration, servings, description, image, is_favourite)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipe.id,
          recipe.title,
          recipe.category,
          recipe.difficulty,
          recipe.duration,
          recipe.servings,
          recipe.description ?? "",
          recipe.image ?? "",
          recipe.isFavourite ? 1 : 0,
        ]
      );

      for (let i = 0; i < recipe.ingredients.length; i++) {
        const ing = recipe.ingredients[i];
        await database.runAsync(
          `INSERT OR REPLACE INTO ingredients
            (id, recipe_id, name, amount, unit, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [ing.id, recipe.id, ing.name, ing.amount, ing.unit ?? "", i]
        );
      }

      for (let i = 0; i < recipe.steps.length; i++) {
        await database.runAsync(
          `INSERT OR REPLACE INTO steps
            (id, recipe_id, step_text, sort_order)
           VALUES (?, ?, ?, ?)`,
          [`${recipe.id}-step-${i}`, recipe.id, recipe.steps[i], i]
        );
      }
    }
  });
}