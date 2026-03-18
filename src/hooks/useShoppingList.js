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

  // ── Load from SQLite on mount ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllShoppingItems();
        setItems(data);
      } catch (e) {
        console.warn("Failed to load shopping list:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Merge incoming list from Meal Planner ─────────────────────────────
  useEffect(() => {
    if (!incomingList || incomingList.length === 0) return;
    const refresh = async () => {
      try {
        // insertShoppingItems uses INSERT OR IGNORE so no duplicates
        await insertShoppingItems(incomingList);
        const data = await getAllShoppingItems();
        setItems(data);
      } catch (e) {
        console.warn("Failed to merge shopping list:", e);
      }
    };
    refresh();
  }, [incomingList]);

  // ── Actions ───────────────────────────────────────────────────────────
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
    // Optimistic update
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

  // ── Derived values ────────────────────────────────────────────────────
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