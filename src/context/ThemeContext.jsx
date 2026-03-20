// src/context/ThemeContext.jsx
import React, {
  createContext, useContext, useState,
  useEffect, useCallback,
} from "react";
import { useColorScheme }  from "react-native";
import AsyncStorage        from "@react-native-async-storage/async-storage";
import { colorScheme }     from "nativewind";

const ThemeContext = createContext();

const THEME_KEY = "recipe-planner-theme"; // AsyncStorage key

export function ThemeProvider({ children }) {
  // "light" | "dark" | "system"
  const [themePreference, setThemePreference] = useState("system");
  const [loaded,          setLoaded]          = useState(false);

  // Get the phone's current system theme
  const systemScheme = useColorScheme(); // "light" | "dark" | null

  // The actual active theme — resolved from preference + system
  const activeTheme =
    themePreference === "system"
      ? (systemScheme ?? "light")
      : themePreference;

  const isDark = activeTheme === "dark";

  // ── Load saved preference on mount ───────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved) {
          setThemePreference(saved);
        }
      } catch (e) {
        console.warn("[Theme] Failed to load preference:", e);
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  // ── Sync NativeWind's colorScheme whenever activeTheme changes ────────
  // This is what actually makes dark: classes activate
  useEffect(() => {
    if (!loaded) return;
    colorScheme.set(activeTheme);
    console.log("[Theme] Active theme:", activeTheme);
  }, [activeTheme, loaded]);

  // ── Save preference and apply ─────────────────────────────────────────
  const setTheme = useCallback(async (preference) => {
    setThemePreference(preference);
    try {
      await AsyncStorage.setItem(THEME_KEY, preference);
    } catch (e) {
      console.warn("[Theme] Failed to save preference:", e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
  }, [isDark, setTheme]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        themePreference, // "light" | "dark" | "system"
        activeTheme,     // "light" | "dark" (resolved)
        isDark,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);