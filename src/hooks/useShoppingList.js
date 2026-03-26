// src/hooks/useShoppingList.js
import { useState, useEffect, useCallback } from "react";
import {
  getAllShoppingItems,
  insertShoppingItem,
  insertShoppingItems,
  toggleShoppingItem,
  deleteShoppingItem,
  deleteCheckedItems,
  clearShoppingList,
} from "../database/shoppingRepository";

export function useShoppingList(incomingList) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load from SQLite on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllShoppingItems();
        console.log("[useShoppingList] Loaded", data.length, "items from DB on mount");
        setItems(data);
      } catch (e) {
        console.warn("[useShoppingList] Failed to load:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Handle incoming list from Meal Planner 
  // incomingList is the array passed via navigation params.
  // It arrives AFTER the initial load, so we refresh from DB after saving.
  useEffect(() => {
    // Guard: must be a real non-empty array (not undefined, null, or a Promise)
    if (!Array.isArray(incomingList) || incomingList.length === 0) {
      if (incomingList !== null && incomingList !== undefined) {
        console.warn(
          "[useShoppingList] incomingList is not a valid array:",
          typeof incomingList,
          incomingList
        );
      }
      return;
    }

    console.log("[useShoppingList] Received", incomingList.length, "items from Meal Planner");

    const merge = async () => {
      try {
        // Use INSERT OR REPLACE so quantities update if the same ingredient
        // appears from a newly generated list (not INSERT OR IGNORE which skips)
        await insertShoppingItems(incomingList);

        // Re-query DB to get the merged, up-to-date list
        const fresh = await getAllShoppingItems();
        console.log("[useShoppingList] After merge:", fresh.length, "total items");
        setItems(fresh);
      } catch (e) {
        console.warn("[useShoppingList] Failed to merge incoming list:", e);
      }
    };

    merge();
  }, [incomingList]);

  // ── Actions
  const toggleItem = useCallback(async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => i.id === id ? { ...i, checked: !i.checked } : i)
    );
    await toggleShoppingItem(id, item.checked);
  }, [items]);

  const removeItem = useCallback(async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteShoppingItem(id);
  }, []);

  const addItem = useCallback(async (name) => {
    if (!name.trim()) return;
    const newItem = {
      id:      `manual-${Date.now()}`,
      name:    name.trim(),
      amount:  0,
      unit:    "",
      checked: false,
    };
    setItems((prev) => [newItem, ...prev]);
    await insertShoppingItem(newItem);
  }, []);

  const clearChecked = useCallback(async () => {
    setItems((prev) => prev.filter((i) => !i.checked));
    await deleteCheckedItems();
  }, []);

  const clearAll = useCallback(async () => {
    setItems([]);
    await clearShoppingList();
  }, []);

  const checkedCount    = items.filter((i) => i.checked).length;
  const totalCount      = items.length;
  const progressPercent = totalCount > 0
    ? Math.round((checkedCount / totalCount) * 100)
    : 0;

  return {
    items,
    loading,
    checkedCount,
    totalCount,
    progressPercent,
    toggleItem,
    removeItem,
    addItem,
    clearChecked,
    clearAll,
  };
}