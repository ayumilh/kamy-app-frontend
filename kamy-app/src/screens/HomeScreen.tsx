"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Bell, User, Search, Plus } from "../components/Icons"
import { Input } from "../components/Input"
import { Button } from "../components/Button"
import { GroupCard } from "../components/GroupCard"
import { getAuth } from "firebase/auth"
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore"

export default function HomeScreen() {
  const navigation = useNavigation()
  const [groups, setGroups] = useState([])
  const [filteredGroups, setFilteredGroups] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState(null)

  const auth = getAuth()
  const db = getFirestore()

  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser)
    }

    loadGroups()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGroups(groups)
    } else {
      const filtered = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredGroups(filtered)
    }
  }, [searchQuery, groups])

  const loadGroups = async () => {
    if (!auth.currentUser) return

    try {
      setIsLoading(true)

      // Get groups where user is a member
      const groupsRef = collection(db, "groups")
      const q = query(groupsRef, where("members", "array-contains", auth.currentUser.uid))
      const querySnapshot = await getDocs(q)

      const groupsData = []

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

      setGroups(groupsData)
      setFilteredGroups(groupsData)
    } catch (error) {
      console.error("Error loading groups:", error)
      Alert.alert("Erro", "Não foi possível carregar seus grupos")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadGroups()
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert("Erro", "Por favor, digite um nome para o grupo")
      return
    }

    try {
      setIsLoading(true)

      // Create new group in Firestore
      const groupRef = await addDoc(collection(db, "groups"), {
        name: newGroupName,
        ownerId: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Add group to user's groups
      const userRef = doc(db, "users", auth.currentUser.uid)
      await updateDoc(userRef, {
        groups: arrayUnion(groupRef.id),
      })

      // Add new group to state
      const newGroup = {
        id: groupRef.id,
        name: newGroupName,
        ownerId: auth.currentUser.uid,
        members: 1,
        tasks: 0,
        completedTasks: 0,
        lastActivity: "Agora",
      }

      setGroups([newGroup, ...groups])
      setNewGroupName("")
      setShowCreateModal(false)

      // Navigate to the new group
      navigation.navigate("Group", { groupId: groupRef.id, groupName: newGroupName })
    } catch (error) {
      console.error("Error creating group:", error)
      Alert.alert("Erro", "Não foi possível criar o grupo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#712ff7" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Kamy</Text>
            <Text style={styles.headerSubtitle}>Organize. Colabore. Realize.</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Notifications")}>
              <Bell color="#fff" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Profile")}>
              <User color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search color="rgba(255, 255, 255, 0.6)" size={20} style={styles.searchIcon} />
          <Input
            placeholder="Buscar grupos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />
        </View>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Seus Grupos</Text>
          <Button
            title="Novo Grupo"
            onPress={() => setShowCreateModal(true)}
            size="sm"
            icon={<Plus color="#fff" size={16} />}
          />
        </View>

        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onPress={() => navigation.navigate("Group", { groupId: item.id, groupName: item.name })}
            />
          )}
          contentContainerStyle={styles.groupsList}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#712ff7"]} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Search color="#999" size={32} />
              </View>
              <Text style={styles.emptyText}>
                {isLoading
                  ? "Carregando grupos..."
                  : searchQuery
                    ? `Nenhum grupo encontrado com "${searchQuery}"`
                    : "Você ainda não tem grupos. Crie um novo grupo para começar."}
              </Text>
            </View>
          }
        />

        {/* Modal de criação de grupo */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCreateModal}
          onRequestClose={() => {
            setShowCreateModal(!showCreateModal)
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Criar Novo Grupo</Text>
              <Input
                label="Nome do Grupo"
                placeholder="Digite o nome do grupo"
                value={newGroupName}
                onChangeText={setNewGroupName}
              />
              <View style={styles.modalButtons}>
                <Button
                  title="Cancelar"
                  onPress={() => setShowCreateModal(false)}
                  variant="outline"
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title={isLoading ? "Criando..." : "Criar"}
                  onPress={handleCreateGroup}
                  disabled={isLoading}
                  loading={isLoading}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          </View>
        </Modal>
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
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    height: 50,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#333",
  },
  groupsList: {
    paddingBottom: 20,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#333",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
  },
})
