// src/context/RecipeContext.jsx
import React, {
  createContext, useContext, useState,
  useEffect, useCallback,
} from "react";
import { initDatabase }                          from "../database/db";
import { getAllRecipes, insertRecipe,
         toggleFavouriteInDb, deleteRecipe }     from "../database/recipeRepository";
import { getAllMealPlan, assignMealInDb,
         removeMealFromDb }                      from "../database/mealPlanRepository";
import { getAllShoppingItems, insertShoppingItems } from "../database/shoppingRepository";

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  const [dbReady,   setDbReady]   = useState(false);
  const [recipes,   setRecipes]   = useState([]);
  const [mealPlan,  setMealPlan]  = useState({});

  // ── Initialise database then load all data ────────────────────────────
  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();           // creates tables + seeds if empty
        await refreshRecipes();         // load recipes into state
        await refreshMealPlan();        // load meal plan into state
        setDbReady(true);
      } catch (e) {
        console.error("Database init failed:", e);
      }
    };
    setup();
  }, []);

  // ── Refresh helpers — re-query DB and update state ────────────────────
  const refreshRecipes = useCallback(async () => {
    const data = await getAllRecipes();
    setRecipes(data);
  }, []);

  const refreshMealPlan = useCallback(async () => {
    const data = await getAllMealPlan();
    setMealPlan(data);
  }, []);

  // ── Recipe actions ────────────────────────────────────────────────────
  const addRecipe = useCallback(async (recipe) => {
    const newRecipe = {
      ...recipe,
      id: Date.now().toString(),
    };
    await insertRecipe(newRecipe);
    await refreshRecipes();           // re-query to get db-generated timestamps
  }, [refreshRecipes]);

  const toggleFavourite = useCallback(async (id) => {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return;
    // Optimistic update — update UI immediately
    setRecipes((prev) =>
      prev.map((r) => r.id === id ? { ...r, isFavourite: !r.isFavourite } : r)
    );
    // Then persist to DB
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

  // ── Shopping list generation ──────────────────────────────────────────
  const generateShoppingList = useCallback(async (weekDates) => {
    const ingredientMap = {};

    weekDates.forEach((dateKey) => {
      const dayMeals = getMealsForDay(dateKey);
      const assignedIds = Object.values(dayMeals).filter(Boolean).map((m) => m.id);

      assignedIds.forEach((recipeId) => {
        const recipe = recipes.find((r) => r.id === recipeId);
        if (!recipe) return;
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

    // Persist to shopping_list table
    await insertShoppingItems(list);

    return list;
  }, [getMealsForDay, recipes]);

  const favourites = recipes.filter((r) => r.isFavourite);

  // ── Don't render children until DB is ready ───────────────────────────
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