"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { ArrowLeft, Calendar } from "../components/Icons"
import { Input } from "../components/Input"
import { Button } from "../components/Button"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"
import { getAuth } from "firebase/auth"
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore"

export default function CreateTaskScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { groupId, groupName } = route.params

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [assignedTo, setAssignedTo] = useState("")
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [titleError, setTitleError] = useState("")
  const [assignedToError, setAssignedToError] = useState("")

  const auth = getAuth()
  const db = getFirestore()

  useEffect(() => {
    loadGroupMembers()
  }, [])

  const loadGroupMembers = async () => {
    try {
      setIsLoading(true)

      // Get group members
      const groupRef = doc(db, "groups", groupId)
      const groupDoc = await getDoc(groupRef)

      if (!groupDoc.exists()) {
        Alert.alert("Erro", "Grupo não encontrado")
        navigation.goBack()
        return
      }

      const groupData = groupDoc.data()
      const memberIds = groupData.members || []

      const membersData = []

      for (const memberId of memberIds) {
        const userRef = doc(db, "users", memberId)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          membersData.push({
            id: memberId,
            name: userData.name,
            email: userData.email,
          })
        }
      }

      setMembers(membersData)

      // Set current user as default assignee
      if (membersData.length > 0) {
        const currentUser = membersData.find((member) => member.id === auth.currentUser.uid)
        if (currentUser) {
          setAssignedTo(currentUser.id)
        } else {
          setAssignedTo(membersData[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading group members:", error)
      Alert.alert("Erro", "Não foi possível carregar os membros do grupo")
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    let isValid = true

    if (!title.trim()) {
      setTitleError("Título é obrigatório")
      isValid = false
    } else {
      setTitleError("")
    }

    if (!assignedTo) {
      setAssignedToError("Selecione um membro para atribuir a tarefa")
      isValid = false
    } else {
      setAssignedToError("")
    }

    return isValid
  }

  const handleCreateTask = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)

      // Format due date to YYYY-MM-DD
      const formattedDueDate = dueDate.toISOString().split("T")[0]

      // Create task in Firestore
      const taskRef = await addDoc(collection(db, "tasks"), {
        title,
        description,
        groupId,
        assignedTo,
        dueDate: formattedDueDate,
        status: "pending",
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Create notification for assigned user
      if (assignedTo !== auth.currentUser.uid) {
        await addDoc(collection(db, "notifications"), {
          userId: assignedTo,
          title: "Nova tarefa atribuída",
          message: `Você recebeu uma nova tarefa: ${title}`,
          type: "task_assigned",
          read: false,
          relatedId: taskRef.id,
          createdAt: serverTimestamp(),
        })
      }

      Alert.alert("Sucesso", "Tarefa criada com sucesso", [{ text: "OK", onPress: () => navigation.goBack() }])
    } catch (error) {
      console.error("Error creating task:", error)
      Alert.alert("Erro", "Não foi possível criar a tarefa")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setDueDate(selectedDate)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#712ff7" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={isLoading}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Nova Tarefa</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.formContainer}>
            <Text style={styles.groupName}>{groupName}</Text>

            <View style={styles.form}>
              <Input
                label="Título"
                placeholder="Digite o título da tarefa"
                value={title}
                onChangeText={(text) => {
                  setTitle(text)
                  if (titleError) setTitleError("")
                }}
                error={titleError}
                editable={!isLoading}
              />

              <Input
                label="Descrição (opcional)"
                placeholder="Descreva a tarefa..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                editable={!isLoading}
              />

              <View style={styles.formGroup}>
                <Text style={styles.label}>Data de entrega</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.dateText}>{dueDate.toLocaleDateString("pt-BR")}</Text>
                  <Calendar color="#666" size={20} />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Atribuir para</Text>
                <View style={[styles.pickerContainer, assignedToError ? styles.pickerError : null]}>
                  <Picker
                    selectedValue={assignedTo}
                    onValueChange={(itemValue) => {
                      setAssignedTo(itemValue)
                      if (assignedToError) setAssignedToError("")
                    }}
                    enabled={!isLoading}
                    style={styles.picker}
                  >
                    {members.map((member) => (
                      <Picker.Item key={member.id} label={member.name} value={member.id} />
                    ))}
                  </Picker>
                </View>
                {assignedToError ? <Text style={styles.errorText}>{assignedToError}</Text> : null}
              </View>

              <Button
                title={isLoading ? "Criando..." : "Criar Tarefa"}
                onPress={handleCreateTask}
                disabled={isLoading}
                loading={isLoading}
                style={styles.submitButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 20,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#fff",
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  groupName: {
    fontSize: 18,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#712ff7",
    marginBottom: 20,
  },
  form: {
    gap: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_500Medium",
    color: "#333",
    marginBottom: 6,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "#333",
  },
  pickerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
  },
  pickerError: {
    borderColor: "#ef4444",
  },
  picker: {
    height: 56,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  submitButton: {
    marginTop: 16,
  },
})
