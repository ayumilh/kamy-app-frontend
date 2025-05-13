import AsyncStorage from "@react-native-async-storage/async-storage"

// URL base da API
const API_URL = "https://seu-backend.vercel.app/api"

// Função para obter o token de autenticação
const getAuthToken = async () => {
  return await AsyncStorage.getItem("@kamy:token")
}

// Função para fazer requisições à API
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await getAuthToken()

    // Configurar headers
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    // Fazer requisição
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // Verificar se a resposta é JSON
    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")
    const data = isJson ? await response.json() : await response.text()

    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(isJson && data.error ? data.error : "Erro na requisição")
    }

    return data
  } catch (error) {
    console.error("API request error:", error)
    throw error
  }
}

// Serviços de autenticação
export const authService = {
  // Registrar usuário
  register: async (name: string, email: string, password: string) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })

    // Salvar token
    if (data.token) {
      await AsyncStorage.setItem("@kamy:token", data.token)
    }

    return data
  },

  // Login
  login: async (email: string, password: string) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    // Salvar token
    if (data.token) {
      await AsyncStorage.setItem("@kamy:token", data.token)
    }

    return data
  },

  // Recuperação de senha
  forgotPassword: async (email: string) => {
    return await apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem("@kamy:token")
    await AsyncStorage.removeItem("@kamy:user")
  },
}

// Serviços de usuário
export const userService = {
  // Obter dados do usuário atual
  getProfile: async () => {
    return await apiRequest("/users/me")
  },

  // Atualizar perfil
  updateProfile: async (data: { name?: string; email?: string }) => {
    return await apiRequest("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // Atualizar senha
  updatePassword: async (currentPassword: string, newPassword: string) => {
    return await apiRequest("/users/me", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },

  // Salvar token de push
  savePushToken: async (pushToken: string) => {
    return await apiRequest("/users/push-token", {
      method: "POST",
      body: JSON.stringify({ pushToken }),
    })
  },
}

// Serviços de grupos
export const groupService = {
  // Obter grupos do usuário
  getGroups: async () => {
    return await apiRequest("/groups")
  },

  // Criar grupo
  createGroup: async (name: string) => {
    return await apiRequest("/groups", {
      method: "POST",
      body: JSON.stringify({ name }),
    })
  },

  // Obter detalhes de um grupo
  getGroupDetails: async (groupId: string) => {
    return await apiRequest(`/groups/${groupId}`)
  },

  // Obter membros de um grupo
  getGroupMembers: async (groupId: string) => {
    return await apiRequest(`/groups/${groupId}/members`)
  },

  // Adicionar membro ao grupo
  addGroupMember: async (groupId: string, email: string) => {
    return await apiRequest(`/groups/${groupId}/members`, {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },
}

// Serviços de tarefas
export const taskService = {
  // Obter tarefas de um grupo
  getGroupTasks: async (groupId: string) => {
    return await apiRequest(`/tasks/group/${groupId}`)
  },

  // Obter tarefas do usuário
  getUserTasks: async () => {
    return await apiRequest("/tasks/my-tasks")
  },

  // Criar tarefa
  createTask: async (taskData: {
    title: string
    description?: string
    groupId: string
    assignedTo: string
    dueDate: string
  }) => {
    return await apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    })
  },

  // Obter detalhes de uma tarefa
  getTaskDetails: async (taskId: string) => {
    return await apiRequest(`/tasks/${taskId}`)
  },

  // Atualizar status da tarefa
  updateTaskStatus: async (taskId: string, status: "pending" | "done") => {
    return await apiRequest(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  },
}

// Serviços de notificações
export const notificationService = {
  // Obter notificações do usuário
  getNotifications: async () => {
    return await apiRequest("/notifications")
  },

  // Marcar notificação como lida
  markAsRead: async (notificationId: string) => {
    return await apiRequest(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    })
  },

  // Marcar todas as notificações como lidas
  markAllAsRead: async () => {
    return await apiRequest("/notifications/read-all", {
      method: "PATCH",
    })
  },
}
