"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { authService, userService } from "../services/api"

// Types
interface User {
  id: string
  email: string
  name: string
}

interface UserProfile {
  name: string
  email: string
  createdAt: Date
  stats: {
    groupsCount: number
    pendingTasksCount: number
  }
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (data: { name?: string; email?: string }) => Promise<void>
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>
  refreshUserProfile: () => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há um token salvo
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("@kamy:token")

        if (token) {
          // Tentar obter dados do usuário
          const userData = await userService.getProfile()

          if (userData.user) {
            setUser({
              id: userData.user.id,
              email: userData.user.email,
              name: userData.user.name,
            })

            setUserProfile({
              name: userData.user.name,
              email: userData.user.email,
              createdAt: new Date(userData.user.createdAt),
              stats: userData.user.stats,
            })

            await AsyncStorage.setItem("@kamy:user", JSON.stringify(userData.user))
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        // Se houver erro, fazer logout
        await authService.logout()
      } finally {
        setLoading(false)
      }
    }

    checkToken()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password)

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      })

      // Buscar perfil completo
      await refreshUserProfile()
    } catch (error) {
      console.error("Erro no login:", error)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await authService.register(name, email, password)

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      })

      // Buscar perfil completo
      await refreshUserProfile()
    } catch (error) {
      console.error("Erro no registro:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error("Erro no logout:", error)
      throw error
    }
  }

  const refreshUserProfile = async () => {
    try {
      if (!user) return

      const userData = await userService.getProfile()

      setUserProfile({
        name: userData.user.name,
        email: userData.user.email,
        createdAt: new Date(userData.user.createdAt),
        stats: userData.user.stats,
      })

      await AsyncStorage.setItem("@kamy:user", JSON.stringify(userData.user))
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      throw error
    }
  }

  const updateUserProfile = async (data: { name?: string; email?: string }) => {
    try {
      await userService.updateProfile(data)

      // Atualizar dados locais
      if (data.name && user) {
        setUser({
          ...user,
          name: data.name,
        })
      }

      if (data.email && user) {
        setUser({
          ...user,
          email: data.email,
        })
      }

      // Atualizar perfil completo
      await refreshUserProfile()
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      throw error
    }
  }

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    try {
      await userService.updatePassword(currentPassword, newPassword)
    } catch (error) {
      console.error("Erro ao atualizar senha:", error)
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    updateUserPassword,
    refreshUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
