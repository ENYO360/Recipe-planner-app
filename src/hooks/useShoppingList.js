// src/hooks/useShoppingList.js
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "recipe-planner-shopping-list";

export function useShoppingList(incomingList) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  // ── On mount — load persisted list from AsyncStorage ─────────────────
  useEffect(() => {
    const loadStored = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setItems(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("Failed to load shopping list:", e);
      } finally {
        setLoading(false);
      }
    };
    loadStored();
  }, []); // runs once on mount

  // ── When a new list is generated from the Meal Planner ───────────────
  // incomingList changes when the user navigates here from the planner
  useEffect(() => {
    if (!incomingList || incomingList.length === 0) return;

    // Merge incoming with existing — don't wipe manual items
    setItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.id));
      const newItems    = incomingList.filter((i) => !existingIds.has(i.id));
      const merged      = [...prev, ...newItems];
      persist(merged);
      return merged;
    });
  }, [incomingList]);

  // ── Persist helper — saves current list to AsyncStorage ──────────────
  const persist = useCallback(async (list) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("Failed to save shopping list:", e);
    }
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────
  const toggleItem = useCallback((id) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      persist(updated);
      return updated;
    });
  }, [persist]);

  const removeItem = useCallback((id) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const addItem = useCallback((name) => {
    if (!name.trim()) return;
    const newItem = {
      id:      `manual-${Date.now()}`,
      name:    name.trim(),
      amount:  1,
      unit:    "",
      checked: false,
    };
    setItems((prev) => {
      const updated = [newItem, ...prev];
      persist(updated);
      return updated;
    });
  }, [persist]);

  const clearChecked = useCallback(() => {
    setItems((prev) => {
      const updated = prev.filter((item) => !item.checked);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const clearAll = useCallback(() => {
    setItems([]);
    persist([]);
  }, [persist]);

  // Derived values
  const checkedCount   = items.filter((i) => i.checked).length;
  const totalCount     = items.length;
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