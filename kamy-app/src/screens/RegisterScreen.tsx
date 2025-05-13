"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from "../components/Icons"
import { Input } from "../components/Input"
import { Button } from "../components/Button"
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { getFirestore, doc, setDoc } from "firebase/firestore"

export default function RegisterScreen() {
  const navigation = useNavigation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nameError, setNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const auth = getAuth()
  const db = getFirestore()

  const validateForm = () => {
    let isValid = true

    // Validate name
    if (!name.trim()) {
      setNameError("Nome é obrigatório")
      isValid = false
    } else {
      setNameError("")
    }

    // Validate email
    if (!email.trim()) {
      setEmailError("Email é obrigatório")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email inválido")
      isValid = false
    } else {
      setEmailError("")
    }

    // Validate password
    if (!password) {
      setPasswordError("Senha é obrigatória")
      isValid = false
    } else if (password.length < 6) {
      setPasswordError("Senha deve ter pelo menos 6 caracteres")
      isValid = false
    } else {
      setPasswordError("")
    }

    return isValid
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update user profile with name
      await updateProfile(user, {
        displayName: name,
      })

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: new Date(),
        groups: [],
      })

      // Navigation will be handled by the onAuthStateChanged listener in App.tsx
    } catch (error) {
      let errorMessage = "Ocorreu um erro ao criar sua conta"

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email já está em uso"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Senha muito fraca"
      }

      Alert.alert("Erro", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <LinearGradient colors={["#712ff7", "#5e21d6"]} style={styles.header} />

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={isLoading}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Criar conta</Text>

          <View style={styles.form}>
            <Input
              label="Nome"
              placeholder="Seu nome"
              value={name}
              onChangeText={(text) => {
                setName(text)
                if (nameError) setNameError("")
              }}
              leftIcon={<User color="#666" size={20} />}
              error={nameError}
              editable={!isLoading}
            />

            <Input
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                if (emailError) setEmailError("")
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail color="#666" size={20} />}
              error={emailError}
              editable={!isLoading}
            />

            <Input
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text)
                if (passwordError) setPasswordError("")
              }}
              secureTextEntry={!showPassword}
              leftIcon={<Lock color="#666" size={20} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff color="#666" size={20} /> : <Eye color="#666" size={20} />}
                </TouchableOpacity>
              }
              error={passwordError}
              editable={!isLoading}
            />

            <Button
              title={isLoading ? "Cadastrando..." : "Cadastrar"}
              onPress={handleRegister}
              disabled={isLoading}
              loading={isLoading}
            />
          </View>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("Login")} disabled={isLoading}>
            <Text style={styles.loginText}>Já tem uma conta? Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    height: 200,
    width: "100%",
    position: "absolute",
    top: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 24,
    marginTop: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  title: {
    fontSize: 24,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#712ff7",
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  loginLink: {
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    color: "#712ff7",
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 16,
  },
})
