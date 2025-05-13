"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import { notificationService } from "../services/api"
import { useAuth } from "./AuthContext"

// Types
export interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  relatedId: string | null
  createdAt: Date
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  handleNotificationPress: (notification: Notification) => void
  refreshNotifications: () => Promise<void>
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()
  const navigation = useNavigation()

  // Load notifications
  useEffect(() => {
    if (user) {
      refreshNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
    }
  }, [user])

  const refreshNotifications = async () => {
    try {
      if (!user) return

      setLoading(true)

      const data = await notificationService.getNotifications()

      const notificationsData = data.notifications.map((notification: any) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        relatedId: notification.relatedId,
        createdAt: new Date(notification.createdAt),
      }))

      setNotifications(notificationsData)
      setUnreadCount(notificationsData.filter((n: Notification) => !n.read).length)
    } catch (error) {
      console.error("Erro ao carregar notificações:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)

      // Atualizar estado local
      setNotifications(
        notifications.map((notification) => {
          if (notification.id === notificationId) {
            return { ...notification, read: true }
          }
          return notification
        }),
      )

      // Atualizar contador de não lidas
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
      throw error
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()

      // Atualizar estado local
      setNotifications(notifications.map((notification) => ({ ...notification, read: true })))

      // Zerar contador de não lidas
      setUnreadCount(0)
    } catch (error) {
      console.error("Erro ao marcar todas notificações como lidas:", error)
      throw error
    }
  }

  // Handle notification press
  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id)

    // Navigate based on notification type
    if (notification.type === "task_assigned" && notification.relatedId) {
      // Navigate to task details
      // @ts-ignore - Navigation typing is complex with multiple navigators
      navigation.navigate("Home", {
        screen: "TaskDetails",
        params: { taskId: notification.relatedId },
      })
    } else if (notification.type === "group_invite" && notification.relatedId) {
      // Navigate to group details
      // @ts-ignore - Navigation typing is complex with multiple navigators
      navigation.navigate("Groups", {
        screen: "GroupDetails",
        params: { groupId: notification.relatedId },
      })
    } else if (notification.type === "task_completed" && notification.relatedId) {
      // Navigate to task details
      // @ts-ignore - Navigation typing is complex with multiple navigators
      navigation.navigate("Home", {
        screen: "TaskDetails",
        params: { taskId: notification.relatedId },
      })
    }
  }

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    handleNotificationPress,
    refreshNotifications,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
