// src/context/RecipeContext.jsx
import React, { createContext, useContext, useState } from "react";
import { SAMPLE_RECIPES } from "../data/sampleRecipes";

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  const [recipes, setRecipes] = useState(SAMPLE_RECIPES);

  // Toggle a recipe's favourite status by id
  const toggleFavourite = (id) => {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isFavourite: !r.isFavourite } : r
      )
    );
  };

  // Add a brand new recipe
  const addRecipe = (recipe) => {
    const newRecipe = {
      ...recipe,
      id: Date.now().toString(), // simple unique id
      isFavourite: false,
    };
    setRecipes((prev) => [newRecipe, ...prev]);
  };

  // Get only favourited recipes
  const favourites = recipes.filter((r) => r.isFavourite);

  return (
    <RecipeContext.Provider
      value={{ recipes, favourites, toggleFavourite, addRecipe }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

// Custom hook — same pattern you already know from React web
export const useRecipes = () => useContext(RecipeContext);