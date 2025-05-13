"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { ArrowLeft, Bell } from "../components/Icons"
import { getAuth } from "firebase/auth"
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, orderBy } from "firebase/firestore"

export default function NotificationsScreen() {
  const navigation = useNavigation()
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const auth = getAuth()
  const db = getFirestore()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)

      // Get notifications for current user
      const notificationsRef = collection(db, "notifications")
      const q = query(notificationsRef, where("userId", "==", auth.currentUser.uid), orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)

      const notificationsData = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()

        notificationsData.push({
          id: doc.id,
          title: data.title,
          message: data.message,
          type: data.type,
          read: data.read,
          relatedId: data.relatedId,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        })
      })

      setNotifications(notificationsData)
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadNotifications()
  }

  const markAsRead = async (notificationId) => {
    try {
      // Update notification in Firestore
      const notificationRef = doc(db, "notifications", notificationId)
      await updateDoc(notificationRef, {
        read: true,
      })

      // Update local state
      setNotifications(
        notifications.map((notification) => {
          if (notification.id === notificationId) {
            return { ...notification, read: true }
          }
          return notification
        }),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const formatTime = (date) => {
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

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={[styles.iconContainer, !item.read && styles.unreadIconContainer]}>
        <Bell color={item.read ? "#999" : "#712ff7"} size={20} />
      </View>

      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>

        <View style={styles.notificationFooter}>
          <Text style={styles.notificationTime}>{formatTime(item.createdAt)}</Text>
          {!item.read && <Text style={styles.unreadBadge}>Não lida</Text>}
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#712ff7" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={styles.title}>Notificações</Text>
          <Text style={styles.subtitle}>Mantenha-se atualizado</Text>
        </View>
      </View>

      {/* Notifications list */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#712ff7"]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell color="#999" size={32} />
            <Text style={styles.emptyText}>
              {isLoading ? "Carregando notificações..." : "Você não tem notificações"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  header: {
    backgroundColor: "#712ff7",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  notificationsList: {
    padding: 20,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#ddd",
  },
  unreadNotification: {
    borderLeftColor: "#712ff7",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  unreadIconContainer: {
    backgroundColor: "rgba(113, 47, 247, 0.1)",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_500Medium",
    color: "#333",
    marginBottom: 4,
  },
  unreadText: {
    color: "#712ff7",
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "#666",
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "#999",
  },
  unreadBadge: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_500Medium",
    color: "#712ff7",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "#999",
    marginTop: 10,
    textAlign: "center",
  },
})
