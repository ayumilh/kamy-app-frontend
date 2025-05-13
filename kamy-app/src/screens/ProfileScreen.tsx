"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { ArrowLeft, LogOut, User, Bell, CheckCircle } from "../components/Icons"
import { Button } from "../components/Button"
import { getAuth, signOut } from "firebase/auth"
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"

export default function ProfileScreen() {
  const navigation = useNavigation()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    groups: 0,
    pendingTasks: 0,
    completedTasks: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  const auth = getAuth()
  const db = getFirestore()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setIsLoading(true)

      if (!auth.currentUser) return

      // Get user data
      const userRef = doc(db, "users", auth.currentUser.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        setUser({
          id: auth.currentUser.uid,
          name: auth.currentUser.displayName || userData.name,
          email: auth.currentUser.email,
          createdAt: userData.createdAt ? new Date(userData.createdAt.toDate()) : new Date(),
        })

        // Get user's groups
        const groupsCount = userData.groups ? userData.groups.length : 0

        // Get user's tasks
        const tasksRef = collection(db, "tasks")
        const q = query(tasksRef, where("assignedTo", "==", auth.currentUser.uid))
        const querySnapshot = await getDocs(q)

        let pendingCount = 0
        let completedCount = 0

        querySnapshot.forEach((doc) => {
          const taskData = doc.data()
          if (taskData.status === "pending") {
            pendingCount++
          } else {
            completedCount++
          }
        })

        setStats({
          groups: groupsCount,
          pendingTasks: pendingCount,
          completedTasks: completedCount,
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      // Navigation will be handled by the onAuthStateChanged listener in App.tsx
    } catch (error) {
      console.error("Error signing out:", error)
      Alert.alert("Erro", "Não foi possível sair da conta")
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#712ff7" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Perfil</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      {/* Profile content */}
      <View style={styles.container}>
        {/* User info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User color="#712ff7" size={40} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "Carregando..."}</Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
            <Text style={styles.userSince}>Membro desde {user ? formatDate(user.createdAt) : "..."}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.groups}</Text>
            <Text style={styles.statLabel}>Grupos</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pendingTasks}</Text>
            <Text style={styles.statLabel}>Tarefas Pendentes</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completedTasks}</Text>
            <Text style={styles.statLabel}>Tarefas Concluídas</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Notifications")}>
            <Bell color="#712ff7" size={24} />
            <Text style={styles.actionText}>Notificações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Navigate to user's tasks (could be implemented in future)
              Alert.alert("Em breve", "Esta funcionalidade estará disponível em breve!")
            }}
          >
            <CheckCircle color="#712ff7" size={24} />
            <Text style={styles.actionText}>Minhas Tarefas</Text>
          </TouchableOpacity>
        </View>

        {/* Logout button */}
        <Button title="Sair da Conta" onPress={handleLogout} variant="outline" style={styles.logoutButtonLarge} />
      </View>
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
    justifyContent: "space-between",
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
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#fff",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(113, 47, 247, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 20,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "#666",
    marginBottom: 8,
  },
  userSince: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "#999",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#712ff7",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "#666",
    textAlign: "center",
  },
  actionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionText: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_500Medium",
    color: "#333",
    marginLeft: 16,
  },
  logoutButtonLarge: {
    marginTop: 20,
  },
})
