import { getDb } from "./db";

// ── READ all recipes (with ingredients + steps)
export async function getAllRecipes() {
  const db = await getDb();

  // Fetch all recipe rows
  const recipeRows = await db.getAllAsync(
    `SELECT * FROM recipes ORDER BY created_at DESC`
  );

  // For each recipe, fetch its ingredients and steps
  const recipes = await Promise.all(
    recipeRows.map(async (row) => {
      const ingredients = await db.getAllAsync(
        `SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY sort_order`,
        [row.id]
      );
      const steps = await db.getAllAsync(
        `SELECT step_text FROM steps WHERE recipe_id = ? ORDER BY sort_order`,
        [row.id]
      );

      return dbRowToRecipe(row, ingredients, steps);
    })
  );

  return recipes;
}

// ── READ single recipe by id
export async function getRecipeById(id) {
  const db = await getDb();

  const row = await db.getFirstAsync(
    `SELECT * FROM recipes WHERE id = ?`, [id]
  );
  if (!row) return null;

  const ingredients = await db.getAllAsync(
    `SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY sort_order`, [id]
  );
  const steps = await db.getAllAsync(
    `SELECT step_text FROM steps WHERE recipe_id = ? ORDER BY sort_order`, [id]
  );

  return dbRowToRecipe(row, ingredients, steps);
}

// ── INSERT new recipe 
export async function insertRecipe(recipe) {
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO recipes
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
        0,
      ]
    );

    for (let i = 0; i < recipe.ingredients.length; i++) {
      const ing = recipe.ingredients[i];
      await db.runAsync(
        `INSERT INTO ingredients (id, recipe_id, name, amount, unit, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`${recipe.id}-ing-${i}`, recipe.id, ing.name, ing.amount, ing.unit ?? "", i]
      );
    }

    for (let i = 0; i < recipe.steps.length; i++) {
      await db.runAsync(
        `INSERT INTO steps (id, recipe_id, step_text, sort_order)
         VALUES (?, ?, ?, ?)`,
        [`${recipe.id}-step-${i}`, recipe.id, recipe.steps[i], i]
      );
    }
  });
}

// ── TOGGLE favourite 
export async function toggleFavouriteInDb(id, currentValue) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE recipes SET is_favourite = ? WHERE id = ?`,
    [currentValue ? 0 : 1, id]
  );
}

// ── DELETE recipe (CASCADE removes ingredients + steps)
export async function deleteRecipe(id) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM recipes WHERE id = ?`, [id]);
}

// ── Map a DB row → our JS recipe shape
function dbRowToRecipe(row, ingredientRows, stepRows) {
  return {
    id:          row.id,
    title:       row.title,
    category:    row.category,
    difficulty:  row.difficulty,
    duration:    row.duration,
    servings:    row.servings,
    description: row.description,
    image:       row.image,
    isFavourite: row.is_favourite === 1,
    ingredients: ingredientRows.map((i) => ({
      id:     i.id,
      name:   i.name,
      amount: i.amount,
      unit:   i.unit,
    })),
    steps: stepRows.map((s) => s.step_text),
  };
}