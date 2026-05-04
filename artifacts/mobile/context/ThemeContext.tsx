import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, Platform } from "react-native";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "theme_mode";

function applyColorScheme(mode: ThemeMode) {
  if (Platform.OS !== "web") {
    Appearance.setColorScheme(mode);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
          setThemeModeState(savedTheme as ThemeMode);
          applyColorScheme(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      } finally {
        setLoaded(true);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
      applyColorScheme(themeMode);
    }
  }, [themeMode, loaded]);

  const isDark = themeMode === "dark";

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    applyColorScheme(mode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
