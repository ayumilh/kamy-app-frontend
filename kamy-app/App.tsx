"use client"

import { useEffect, useState } from "react"
import { LogBox } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk"
import * as SplashScreen from "expo-splash-screen"
import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

// Context providers
import { AuthProvider } from "./src/contexts/AuthContext"
import { ThemeProvider } from "./src/contexts/ThemeContext"
import { NotificationProvider } from "./src/contexts/NotificationContext"

// Navigation
import AuthNavigator from "./src/navigation/AuthNavigator"
import MainNavigator from "./src/navigation/MainNavigator"

// Utils
import { registerForPushNotificationsAsync } from "./src/utils/notifications"

// Ignore specific warnings
LogBox.ignoreLogs([
  "AsyncStorage has been extracted from react-native",
  "Setting a timer for a long period of time",
  "VirtualizedLists should never be nested",
])

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [initializing, setInitializing] = useState(true)

  // Load fonts
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  })

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("@kamy:token")
        setIsAuthenticated(!!token)

        if (token) {
          // Register for push notifications
          const pushToken = await registerForPushNotificationsAsync()
          if (pushToken) {
            // Store token in AsyncStorage
            await AsyncStorage.setItem("@kamy:pushToken", pushToken)
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setIsAuthenticated(false)
      } finally {
        setInitializing(false)
      }
    }

    checkAuth()
  }, [])

  // Set up notification listeners
  useEffect(() => {
    // Handle notification received while app is foregrounded
    const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received in foreground:", notification)
    })

    // Handle notification interaction
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response)
      const data = response.notification.request.content.data

      // Handle navigation based on notification type
      if (data.type === "task_assigned" && data.taskId && data.groupId) {
        // Navigate to task details
        // This will be handled by the NotificationContext
      }
    })

    return () => {
      foregroundSubscription.remove()
      responseSubscription.remove()
    }
  }, [])

  // Hide splash screen when ready
  useEffect(() => {
    if (fontsLoaded && isAuthenticated !== null) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, isAuthenticated])

  if (!fontsLoaded || isAuthenticated === null) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <NavigationContainer>
                <StatusBar style="light" />
                {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
              </NavigationContainer>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
