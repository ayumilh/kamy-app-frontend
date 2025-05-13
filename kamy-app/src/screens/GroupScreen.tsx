"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { ArrowLeft, Plus, Filter, MoreVertical, CheckCircle, Circle } from "../components/Icons"
import { Button } from "../components/Button"
import { TaskCard } from "../components/TaskCard"
import { getAuth } from "firebase/auth"
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"

export default function GroupScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { groupId, groupName } = route.params

  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [filter, setFilter] = useState("all") // all, pending, done
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [groupInfo, setGroupInfo] = useState({
    members: 0,
    pendingTasks: 0,
    completedTasks: 0,
  })

  const auth = getAuth()
  const db = getFirestore()

  useEffect(() => {
    loadGroupData()
  }, [])

  useEffect(() => {
    if (filter === "all") {
      setFilteredTasks(tasks)
    } else {
      const filtered = tasks.filter((task) => task.status === filter)
      setFilteredTasks(filtered)
    }
  }, [filter, tasks])

  const loadGroupData = async () => {
    try {
      setIsLoading(true)

      // Get group info
      const groupRef = doc(db, "groups", groupId)
      const groupDoc = await getDoc(groupRef)

      if (!groupDoc.exists()) {
        Alert.alert("Erro", "Grupo não encontrado")
        navigation.goBack()
        return
      }

      const groupData = groupDoc.data()

      // Get tasks
      const tasksRef = collection(db, "tasks")
      const q = query(tasksRef, where("groupId", "==", groupId))
      const querySnapshot = await getDocs(q)

      const tasksData = []
      let pendingCount = 0
      let completedCount = 0

      for (const doc of querySnapshot.docs) {
        const taskData = doc.data()

        // Get assigned user info
        const userRef = doc(db, "users", taskData.assignedTo)
        const userDoc = await getDoc(userRef)
        const userData = userDoc.exists() ? userDoc.data() : { name: "Usuário desconhecido" }

        const task = {
          id: doc.id,
          title: taskData.title,
          description: taskData.description,
          assignedTo: taskData.assignedTo,
          assignedToName: userData.name,
          dueDate: taskData.dueDate,
          status: taskData.status,
          createdAt: taskData.createdAt ? new Date(taskData.createdAt.toDate()) : new Date(),
        }

        tasksData.push(task)

        if (task.status === "pending") {
          pendingCount++
        } else {
          completedCount++
        }
      }

      // Sort tasks by due date (closest first)
      tasksData.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

      setTasks(tasksData)
      setFilteredTasks(tasksData)
      setGroupInfo({
        members: groupData.members.length,
        pendingTasks: pendingCount,
        completedTasks: completedCount,
      })
    } catch (error) {
      console.error("Error loading group data:", error)
      Alert.alert("Erro", "Não foi possível carregar os dados do grupo")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadGroupData()
  }

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === "pending" ? "done" : "pending"

      // Update task in Firestore
      const taskRef = doc(db, "tasks", taskId)
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      })

      // Update group's updatedAt timestamp
      const groupRef = doc(db, "groups", groupId)
      await updateDoc(groupRef, {
        updatedAt: serverTimestamp(),
      })

      // Update local state
      const updatedTasks = tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, status: newStatus }
        }
        return task
      })

      setTasks(updatedTasks)

      // Update group info counts
      const pendingCount = updatedTasks.filter((task) => task.status === "pending").length
      const completedCount = updatedTasks.filter((task) => task.status === "done").length

      setGroupInfo({
        ...groupInfo,
        pendingTasks: pendingCount,
        completedTasks: completedCount,
      })
    } catch (error) {
      console.error("Error toggling task status:", error)
      Alert.alert("Erro", "Não foi possível atualizar o status da tarefa")
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#712ff7" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <Text style={styles.groupName}>{groupName}</Text>
            <Text style={styles.memberCount}>{groupInfo.members} membros</Text>
          </View>

          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Pendentes</Text>
            <Text style={styles.statValue}>{groupInfo.pendingTasks}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Concluídas</Text>
            <Text style={styles.statValue}>{groupInfo.completedTasks}</Text>
          </View>

          <Button
            title="Nova Tarefa"
            size="sm"
            icon={<Plus color="#712ff7" size={16} />}
            variant="secondary"
            onPress={() => navigation.navigate("CreateTask", { groupId, groupName })}
          />
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === "all" && styles.activeFilterTab]}
            onPress={() => setFilter("all")}
          >
            <Text style={[styles.filterText, filter === "all" && styles.activeFilterText]}>Todas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === "pending" && styles.activeFilterTab]}
            onPress={() => setFilter("pending")}
          >
            <Circle color={filter === "pending" ? "#fff" : "#666"} size={16} />
            <Text style={[styles.filterText, filter === "pending" && styles.activeFilterText]}>Pendentes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === "done" && styles.activeFilterTab]}
            onPress={() => setFilter("done")}
          >
            <CheckCircle color={filter === "done" ? "#fff" : "#666"} size={16} />
            <Text style={[styles.filterText, filter === "done" && styles.activeFilterText]}>Concluídas</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Task list */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onToggleStatus={() => handleToggleTaskStatus(item.id, item.status)} />
        )}
        contentContainerStyle={styles.tasksList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#712ff7"]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Filter color="#999" size={32} />
            </View>
            <Text style={styles.emptyText}>
              {isLoading
                ? "Carregando tarefas..."
                : filter !== "all"
                  ? `Não há tarefas ${filter === "pending" ? "pendentes" : "concluídas"}`
                  : "Nenhuma tarefa encontrada. Crie uma nova tarefa para começar."}
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
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
    flex: 1,
    marginLeft: 15,
  },
  groupName: {
    fontSize: 20,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#fff",
  },
  memberCount: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    marginRight: 20,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#fff",
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  filterTabs: {
    flexDirection: "row",
    paddingBottom: 10,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  activeFilterTab: {
    backgroundColor: "#712ff7",
  },
  filterText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  activeFilterText: {
    color: "#fff",
  },
  tasksList: {
    padding: 20,
    paddingTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyIcon: {
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "#999",
    textAlign: "center",
  },
})
