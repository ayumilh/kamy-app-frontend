"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Theme types
export type ThemeMode = "light" | "dark" | "system"

interface ThemeColors {
  primary: string
  background: string
  card: string
  text: string
  border: string
  notification: string
  error: string
  success: string
  warning: string
  info: string
}

interface Theme {
  dark: boolean
  colors: ThemeColors
}

// Light and dark themes
const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: "#712ff7",
    background: "#f0f0f0",
    card: "#ffffff",
    text: "#333333",
    border: "#e0e0e0",
    notification: "#ff3b30",
    error: "#ff3b30",
    success: "#34c759",
    warning: "#ff9500",
    info: "#007aff",
  },
}

const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: "#8c5cf7",
    background: "#121212",
    card: "#1e1e1e",
    text: "#f0f0f0",
    border: "#2c2c2c",
    notification: "#ff453a",
    error: "#ff453a",
    success: "#30d158",
    warning: "#ff9f0a",
    info: "#0a84ff",
  },
}

// Context type
interface ThemeContextType {
  theme: Theme
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system")
  const [theme, setTheme] = useState<Theme>(colorScheme === "dark" ? darkTheme : lightTheme)

  // Load saved theme mode
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem("@kamy:themeMode")
        if (savedThemeMode) {
          setThemeModeState(savedThemeMode as ThemeMode)
        }
      } catch (error) {
        console.error("Error loading theme mode:", error)
      }
    }

    loadThemeMode()
  }, [])

  // Update theme when theme mode changes
  useEffect(() => {
    let newTheme: Theme

    if (themeMode === "system") {
      newTheme = colorScheme === "dark" ? darkTheme : lightTheme
    } else {
      newTheme = themeMode === "dark" ? darkTheme : lightTheme
    }

    setTheme(newTheme)
  }, [themeMode, colorScheme])

  // Set theme mode and save to storage
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode)
    try {
      await AsyncStorage.setItem("@kamy:themeMode", mode)
    } catch (error) {
      console.error("Error saving theme mode:", error)
    }
  }

  const value = {
    theme,
    themeMode,
    setThemeMode,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
