// src/context/RecipeContext.jsx
import React, { createContext, useContext, useState } from "react";
import { SAMPLE_RECIPES } from "../data/sampleRecipes";

const RecipeContext = createContext();

// ── Meal plan shape ───────────────────────────────────────────────────────────
// {
//   "2024-03-11": {
//     breakfast: { id, title, image, duration } | null,
//     lunch:     { id, title, image, duration } | null,
//     dinner:    { id, title, image, duration } | null,
//   },
//   ...
// }

export function RecipeProvider({ children }) {
  const [recipes,  setRecipes]  = useState(SAMPLE_RECIPES);
  const [mealPlan, setMealPlan] = useState({});

  // ── Recipe actions ────────────────────────────────────────────────────
  const toggleFavourite = (id) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavourite: !r.isFavourite } : r))
    );
  };

  const addRecipe = (recipe) => {
    setRecipes((prev) => [
      { ...recipe, id: Date.now().toString(), isFavourite: false },
      ...prev,
    ]);
  };

  // ── Meal plan actions ─────────────────────────────────────────────────

  // Assign a recipe to a specific day + meal slot
  const assignMeal = (dateKey, mealType, recipe) => {
    setMealPlan((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: {
          id:       recipe.id,
          title:    recipe.title,
          image:    recipe.image,
          duration: recipe.duration,
          category: recipe.category,
        },
      },
    }));
  };

  // Remove a recipe from a specific day + meal slot
  const removeMeal = (dateKey, mealType) => {
    setMealPlan((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: null,
      },
    }));
  };

  // Get the meal plan entry for a specific day
  const getMealsForDay = (dateKey) => {
    return mealPlan[dateKey] ?? { breakfast: null, lunch: null, dinner: null };
  };

  // Generate a flat shopping list from all planned meals this week
  const generateShoppingList = (weekDates) => {
    const ingredientMap = {};

    weekDates.forEach((dateKey) => {
      const dayMeals = getMealsForDay(dateKey);
      const assignedRecipeIds = Object.values(dayMeals).filter(Boolean).map((m) => m.id);

      assignedRecipeIds.forEach((recipeId) => {
        const recipe = recipes.find((r) => r.id === recipeId);
        if (!recipe) return;

        recipe.ingredients.forEach((ing) => {
          const key = `${ing.name.toLowerCase()}-${ing.unit}`;
          if (ingredientMap[key]) {
            // Accumulate amounts for the same ingredient
            ingredientMap[key].amount += ing.amount;
          } else {
            ingredientMap[key] = {
              id:     key,
              name:   ing.name,
              amount: ing.amount,
              unit:   ing.unit,
              checked: false,
            };
          }
        });
      });
    });

    return Object.values(ingredientMap);
  };

  const favourites = recipes.filter((r) => r.isFavourite);

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        favourites,
        mealPlan,
        toggleFavourite,
        addRecipe,
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