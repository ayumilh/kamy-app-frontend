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
import { Bell, User, Calendar, CheckCircle } from "../../components/Icons"
import { Button } from "../../components/Button"
import { GroupCard } from "../../components/GroupCard"
import { TaskCard } from "../../components/TaskCard"
import type { HomeScreenNavigationProp } from "../../types/navigation"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useNotifications } from "../../contexts/NotificationContext"
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp<"HomeMain">>()
  const { theme } = useTheme()
  const { user, userProfile } = useAuth()
  const { unreadCount } = useNotifications()

  const [recentGroups, setRecentGroups] = useState<any[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const db = getFirestore()

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    try {
      setIsLoading(true)

      if (!user) return

      // Load recent groups
      const groupsData = await loadRecentGroups()
      setRecentGroups(groupsData)

      // Load upcoming tasks
      const tasksData = await loadUpcomingTasks()
      setUpcomingTasks(tasksData)
    } catch (error) {
      console.error("Error loading home data:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const loadRecentGroups = async () => {
    // Get groups where user is a member
    const groupsRef = collection(db, "groups")
    const q = query(groupsRef, where("members", "array-contains", user!.uid), orderBy("updatedAt", "desc"), limit(3))

    const querySnapshot = await getDocs(q)
    const groupsData: any[] = []

    for (const doc of querySnapshot.docs) {
      const groupData = doc.data()

      // Get tasks count
      const tasksRef = collection(db, "tasks")
      const tasksQuery = query(tasksRef, where("groupId", "==", doc.id))
      const tasksSnapshot = await getDocs(tasksQuery)

      const totalTasks = tasksSnapshot.size
      let completedTasks = 0

      tasksSnapshot.forEach((taskDoc) => {
        if (taskDoc.data().status === "done") {
          completedTasks++
        }
      })

      groupsData.push({
        id: doc.id,
        name: groupData.name,
        ownerId: groupData.ownerId,
        members: groupData.members.length,
        tasks: totalTasks,
        completedTasks,
        lastActivity: groupData.updatedAt
          ? new Date(groupData.updatedAt.toDate()).toLocaleDateString()
          : "Sem atividade",
      })
    }

    return groupsData
  }

  const loadUpcomingTasks = async () => {
    // Get upcoming tasks assigned to user
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tasksRef = collection(db, "tasks")
    const q = query(
      tasksRef,
      where("assignedTo", "==", user!.uid),
      where("status", "==", "pending"),
      orderBy("dueDate", "asc"),
      limit(5),
    )

    const querySnapshot = await getDocs(q)
    const tasksData: any[] = []

    for (const doc of querySnapshot.docs) {
      const taskData = doc.data()

      // Get group info
      const groupRef = await getFirestore().doc(`groups/${taskData.groupId}`).get()
      const groupData = groupRef.exists ? groupRef.data() : { name: "Grupo desconhecido" }

      tasksData.push({
        id: doc.id,
        title: taskData.title,
        description: taskData.description,
        groupId: taskData.groupId,
        groupName: groupData.name,
        assignedTo: taskData.assignedTo,
        assignedToName: user!.displayName,
        dueDate: taskData.dueDate,
        status: taskData.status,
      })
    }

    return tasksData
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadHomeData()
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Calendar color={theme.colors.text} size={48} style={{ opacity: 0.5 }} />
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        {isLoading ? "Carregando..." : "Você não tem tarefas pendentes"}
      </Text>
      <Button
        title="Criar nova tarefa"
        onPress={() => navigation.navigate("Groups")}
        style={{ marginTop: 16 }}
        size="sm"
      />
    </View>
  )

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Olá, {userProfile?.name.split(" ")[0] || "Usuário"}</Text>
            <Text style={styles.headerSubtitle}>Organize. Colabore. Realize.</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Notifications")}>
              <Bell color="#fff" size={20} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Profile")}>
              <User color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main content */}
      <FlatList
        data={upcomingTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate("TaskDetails", { taskId: item.id, groupId: item.groupId })}
            showGroup
          />
        )}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {/* Recent Groups Section */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Grupos Recentes</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Groups")}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {recentGroups.length > 0 ? (
              <FlatList
                horizontal
                data={recentGroups}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <GroupCard
                    group={item}
                    onPress={() => navigation.navigate("GroupDetails", { groupId: item.id, groupName: item.name })}
                    style={styles.horizontalGroupCard}
                  />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            ) : (
              <View style={styles.emptyGroupsContainer}>
                <Text style={[styles.emptyGroupsText, { color: theme.colors.text }]}>
                  {isLoading ? "Carregando grupos..." : "Você ainda não participa de nenhum grupo"}
                </Text>
                <Button
                  title="Criar grupo"
                  onPress={() => navigation.navigate("Groups", { screen: "CreateGroup" })}
                  style={{ marginTop: 8 }}
                  size="sm"
                />
              </View>
            )}

            {/* Upcoming Tasks Section */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tarefas Pendentes</Text>
              <View style={styles.taskStatusBadge}>
                <CheckCircle color={theme.colors.primary} size={14} />
                <Text style={[styles.taskStatusText, { color: theme.colors.primary }]}>
                  {upcomingTasks.length} pendentes
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={isLoading ? null : renderEmptyState()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 10,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_500Medium",
  },
  horizontalList: {
    paddingBottom: 8,
  },
  horizontalGroupCard: {
    width: 280,
    marginRight: 16,
  },
  taskStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(113, 47, 247, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  taskStatusText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_500Medium",
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    textAlign: "center",
    marginTop: 16,
  },
  emptyGroupsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginBottom: 16,
  },
  emptyGroupsText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    textAlign: "center",
  },
})

export default HomeScreen
