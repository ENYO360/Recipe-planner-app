// src/context/RecipeContext.jsx
import React, {
  createContext, useContext, useState,
  useEffect, useCallback,
} from "react";
import { initDatabase }                              from "../database/db";
import { getAllRecipes, insertRecipe,
         toggleFavouriteInDb, deleteRecipe }         from "../database/recipeRepository";
import { getAllMealPlan, assignMealInDb,
         removeMealFromDb }                          from "../database/mealPlanRepository";
import { insertShoppingItems }                       from "../database/shoppingRepository";

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  const [dbReady,  setDbReady]  = useState(false);
  const [recipes,  setRecipes]  = useState([]);
  const [mealPlan, setMealPlan] = useState({});

  // ── Init DB then load all data ────────────────────────────────────────
  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        await refreshRecipes();
        await refreshMealPlan();
        setDbReady(true);
      } catch (e) {
        console.error("[RecipeContext] Database init failed:", e);
      }
    };
    setup();
  }, []);

  // ── Refresh helpers ───────────────────────────────────────────────────
  const refreshRecipes = useCallback(async () => {
    const data = await getAllRecipes();
    console.log(`[RecipeContext] Loaded ${data.length} recipes from DB`);
    // Debug: log ingredient counts
    data.forEach(r => {
      if (r.ingredients.length === 0) {
        console.warn(`[RecipeContext] ⚠️ Recipe "${r.title}" (${r.id}) has 0 ingredients`);
      }
    });
    setRecipes(data);
  }, []);

  const refreshMealPlan = useCallback(async () => {
    const data = await getAllMealPlan();
    setMealPlan(data);
  }, []);

  // ── Recipe actions ────────────────────────────────────────────────────
  const addRecipe = useCallback(async (recipe) => {
    const newRecipe = { ...recipe, id: Date.now().toString() };
    await insertRecipe(newRecipe);
    await refreshRecipes();
  }, [refreshRecipes]);

  const toggleFavourite = useCallback(async (id) => {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return;
    // Optimistic update
    setRecipes((prev) =>
      prev.map((r) => r.id === id ? { ...r, isFavourite: !r.isFavourite } : r)
    );
    await toggleFavouriteInDb(id, recipe.isFavourite);
  }, [recipes]);

  const removeRecipe = useCallback(async (id) => {
    await deleteRecipe(id);
    await refreshRecipes();
  }, [refreshRecipes]);

  // ── Meal plan actions ─────────────────────────────────────────────────
  const assignMeal = useCallback(async (dateKey, mealType, recipe) => {
    // Optimistic update
    setMealPlan((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: {
          id:       recipe.id,
          title:    recipe.title,
          image:    recipe.image,
          duration: recipe.duration,
        },
      },
    }));
    await assignMealInDb(dateKey, mealType, recipe);
  }, []);

  const removeMeal = useCallback(async (dateKey, mealType) => {
    // Optimistic update
    setMealPlan((prev) => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], [mealType]: null },
    }));
    await removeMealFromDb(dateKey, mealType);
  }, []);

  const getMealsForDay = useCallback((dateKey) => {
    return mealPlan[dateKey] ?? { breakfast: null, lunch: null, dinner: null };
  }, [mealPlan]);

  // ── Generate shopping list ────────────────────────────────────────────
  // IMPORTANT: this is async — always await it at the call site
  const generateShoppingList = useCallback(async (weekDates) => {
    console.log("[generateShoppingList] Starting for", weekDates.length, "days");
    console.log("[generateShoppingList] Recipes in state:", recipes.length);

    const ingredientMap = {};

    weekDates.forEach((dateKey) => {
      const dayMeals    = getMealsForDay(dateKey);
      const assignedIds = Object.values(dayMeals)
        .filter(Boolean)
        .map((m) => m.id);

      if (assignedIds.length > 0) {
        console.log(`[generateShoppingList] ${dateKey} has meals:`, assignedIds);
      }

      assignedIds.forEach((recipeId) => {
        const recipe = recipes.find((r) => r.id === recipeId);

        if (!recipe) {
          console.warn(`[generateShoppingList] Recipe ${recipeId} not found in state`);
          return;
        }

        if (!recipe.ingredients || recipe.ingredients.length === 0) {
          console.warn(`[generateShoppingList] Recipe "${recipe.title}" has no ingredients`);
          return;
        }

        console.log(`[generateShoppingList] Adding ${recipe.ingredients.length} ingredients from "${recipe.title}"`);

        recipe.ingredients.forEach((ing) => {
          const key = `${ing.name.toLowerCase()}-${ing.unit}`;
          if (ingredientMap[key]) {
            ingredientMap[key].amount += ing.amount;
          } else {
            ingredientMap[key] = {
              id:      key,
              name:    ing.name,
              amount:  ing.amount,
              unit:    ing.unit,
              checked: false,
            };
          }
        });
      });
    });

    const list = Object.values(ingredientMap);
    console.log(`[generateShoppingList] Generated ${list.length} unique ingredients`);

    // Save to DB so Shopping screen can load from SQLite
    if (list.length > 0) {
      await insertShoppingItems(list);
      console.log("[generateShoppingList] Saved to shopping_list DB");
    }

    // Return the array — NOT a Promise — caller must await this function
    return list;
  }, [getMealsForDay, recipes]);

  const favourites = recipes.filter((r) => r.isFavourite);

  if (!dbReady) return null;

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        favourites,
        mealPlan,
        addRecipe,
        toggleFavourite,
        removeRecipe,
        assignMeal,
        removeMeal,
        getMealsForDay,
        generateShoppingList,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export const useRecipes = () => useContext(RecipeContext);