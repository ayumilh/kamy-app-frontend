import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!")
      return
    }

    token = (await Notifications.getExpoPushTokenAsync()).data
  } else {
    alert("Must use physical device for Push Notifications")
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#712FF7",
    })
  }

  return token
}

// Save user's push token to Firestore
export async function savePushToken(userId: string, token: string) {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      await setDoc(userRef, { pushToken: token }, { merge: true })
    }
  } catch (error) {
    console.error("Error saving push token:", error)
  }
}

// Send notification to a user
export async function sendPushNotification(userIds: string[], title: string, body: string, data = {}) {
  try {
    // Get push tokens for all users
    const tokens = []

    for (const userId of userIds) {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists() && userSnap.data().pushToken) {
        tokens.push(userSnap.data().pushToken)
      }
    }

    // Send notifications to all tokens
    for (const pushToken of tokens) {
      const message = {
        to: pushToken,
        sound: "default",
        title,
        body,
        data,
      }

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })
    }
  } catch (error) {
    console.error("Error sending push notification:", error)
  }
}
