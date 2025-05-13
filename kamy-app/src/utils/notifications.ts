import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { userService } from "../services/api"

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token

  if (!Device.isDevice) {
    console.log("Must use physical device for Push Notifications")
    return
  }
  console.log("Must use physical device for Push Notifications")
  return

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!")
    return
  }

  token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: "your-expo-project-id", // Replace with your Expo project ID
    })
  ).data

  // Android specific setup
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#712FF7",
    })
  }

  // Save token to backend
  try {
    const token = await AsyncStorage.getItem("@kamy:token")
    if (token) {
      await userService.savePushToken(token)
    }
  } catch (error) {
    console.error("Error saving push token:", error)
  }

  return token
}

// Format notification time
export function formatNotificationTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} dia${days > 1 ? "s" : ""} atrás`
  } else if (hours > 0) {
    return `${hours} hora${hours > 1 ? "s" : ""} atrás`
  } else if (minutes > 0) {
    return `${minutes} minuto${minutes > 1 ? "s" : ""} atrás`
  } else {
    return "Agora mesmo"
  }
}
