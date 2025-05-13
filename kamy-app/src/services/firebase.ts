import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from "firebase/firestore"

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Auth functions
export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      groups: [],
      createdAt: Timestamp.now(),
    })

    return user
  } catch (error) {
    throw error
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw error
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    throw error
  }
}

// Group functions
export const createGroup = async (name: string, userId: string) => {
  try {
    // Create new group
    const groupRef = await addDoc(collection(db, "groups"), {
      name,
      ownerId: userId,
      members: [userId],
      createdAt: Timestamp.now(),
    })

    // Update user's groups array
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()
      const groups = userData.groups || []

      await updateDoc(userRef, {
        groups: [...groups, groupRef.id],
      })
    }

    return groupRef.id
  } catch (error) {
    throw error
  }
}

export const getUserGroups = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return []
    }

    const userData = userSnap.data()
    const groupIds = userData.groups || []

    const groups = []

    for (const groupId of groupIds) {
      const groupRef = doc(db, "groups", groupId)
      const groupSnap = await getDoc(groupRef)

      if (groupSnap.exists()) {
        groups.push({
          id: groupId,
          ...groupSnap.data(),
        })
      }
    }

    return groups
  } catch (error) {
    throw error
  }
}

// Task functions
export const createTask = async (
  groupId: string,
  title: string,
  description: string,
  assignedTo: string,
  dueDate: string,
) => {
  try {
    const taskRef = await addDoc(collection(db, "tasks"), {
      groupId,
      title,
      description,
      assignedTo,
      dueDate,
      status: "pending",
      createdAt: Timestamp.now(),
    })

    return taskRef.id
  } catch (error) {
    throw error
  }
}

export const getGroupTasks = async (groupId: string) => {
  try {
    const tasksQuery = query(collection(db, "tasks"), where("groupId", "==", groupId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(tasksQuery)
    const tasks = []

    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return tasks
  } catch (error) {
    throw error
  }
}

export const updateTaskStatus = async (taskId: string, status: "pending" | "done") => {
  try {
    const taskRef = doc(db, "tasks", taskId)
    await updateDoc(taskRef, { status })
  } catch (error) {
    throw error
  }
}

export { auth, db }
