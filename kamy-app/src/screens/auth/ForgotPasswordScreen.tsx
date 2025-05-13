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
import { ArrowLeft, Mail } from "../../components/Icons"
import { Input } from "../../components/Input"
import { Button } from "../../components/Button"
import type { AuthScreenNavigationProp } from "../../types/navigation"
import { useTheme } from "../../contexts/ThemeContext"
import { getAuth, sendPasswordResetEmail } from "firebase/auth"

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<AuthScreenNavigationProp<"ForgotPassword">>()
  const { theme } = useTheme()

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [resetSent, setResetSent] = useState(false)

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

    return isValid
  }

  const handleResetPassword = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)
      await sendPasswordResetEmail(auth, email)
      setResetSent(true)
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro ao enviar o email de redefinição"

      if (error.code === "auth/user-not-found") {
        errorMessage = "Não encontramos uma conta com este email"
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
          <Text style={[styles.title, { color: theme.colors.primary }]}>Recuperar Senha</Text>

          {resetSent ? (
            <View style={styles.successContainer}>
              <Text style={[styles.successTitle, { color: theme.colors.success }]}>Email enviado!</Text>
              <Text style={[styles.successText, { color: theme.colors.text }]}>
                Enviamos um email com instruções para redefinir sua senha. Por favor, verifique sua caixa de entrada.
              </Text>
              <Button
                title="Voltar para o login"
                onPress={() => navigation.navigate("Login")}
                style={{ marginTop: 24 }}
              />
            </View>
          ) : (
            <>
              <Text style={[styles.subtitle, { color: theme.colors.text }]}>
                Digite seu email e enviaremos instruções para redefinir sua senha.
              </Text>

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

                <Button
                  title={isLoading ? "Enviando..." : "Enviar instruções"}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  loading={isLoading}
                />
              </View>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate("Login")}
                disabled={isLoading}
              >
                <Text style={[styles.loginText, { color: theme.colors.primary }]}>Lembrou sua senha? Entrar</Text>
              </TouchableOpacity>
            </>
          )}
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
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
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 16,
  },
  successContainer: {
    alignItems: "center",
    padding: 16,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: "SpaceGrotesk_700Bold",
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
})

export default ForgotPasswordScreen
