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
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "../../components/Icons"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import type { AuthScreenNavigationProp } from "../../types/navigation"
import { useTheme } from "../../contexts/ThemeContext"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"

const LoginScreen = () => {
  const navigation = useNavigation<AuthScreenNavigationProp<"Login">>()
  const { theme } = useTheme()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const auth = getAuth()

  const validateForm = () => {
    let isValid = true

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
    } else {
      setPasswordError("")
    }

    return isValid
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      // Navigation will be handled by the onAuthStateChanged listener in App.tsx
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro ao fazer login"

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Email ou senha incorretos"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Muitas tentativas de login. Tente novamente mais tarde"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido"
      }

      Alert.alert("Erro", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <LinearGradient colors={[theme.colors.primary, "#5e21d6"]} style={styles.header} />

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={isLoading}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>

        <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Bem-vindo de volta</Text>

          <View style={styles.form}>
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

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("ForgotPassword")}
              disabled={isLoading}
            >
              <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            <Button
              title={isLoading ? "Entrando..." : "Entrar"}
              onPress={handleLogin}
              disabled={isLoading}
              loading={isLoading}
            />
          </View>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate("Register")}
            disabled={isLoading}
          >
            <Text style={[styles.registerText, { color: theme.colors.primary }]}>Não tem uma conta? Cadastre-se</Text>
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
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
  },
  registerLink: {
    marginTop: 24,
    alignItems: "center",
  },
  registerText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 16,
  },
})

export default LoginScreen
