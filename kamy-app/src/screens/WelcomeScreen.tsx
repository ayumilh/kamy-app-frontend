"use client"

import { useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowRight } from "../components/Icons"

export default function WelcomeScreen() {
  const navigation = useNavigation()
  const fadeAnim = new Animated.Value(0)
  const slideAnim = new Animated.Value(20)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <LinearGradient colors={["#712ff7", "#5e21d6"]} style={styles.container}>
      {/* Animated background elements */}
      <View style={styles.backgroundElements}>
        {[...Array(5)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.floatingBubble,
              {
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.1,
              },
            ]}
          />
        ))}
      </View>

      {/* Logo animation */}
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <Text style={styles.logoText}>
          <Text style={{ opacity: 0.8 }}>K</Text>
          <Text style={{ opacity: 0.9 }}>a</Text>
          <Text style={{ opacity: 0.95 }}>m</Text>
          <Text>y</Text>
        </Text>
        <View style={styles.logoUnderline}>
          <Animated.View style={styles.logoUnderlineInner} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity style={styles.buttonOutline} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.buttonOutlineText}>Entrar com e-mail</Text>
          <ArrowRight color="#ffffff" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonFilled} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.buttonFilledText}>Cadastrar</Text>
          <ArrowRight color="#712ff7" size={20} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.Text
        style={[
          styles.footerText,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        Organize. Colabore. Realize.
      </Animated.Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  backgroundElements: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  floatingBubble: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "white",
  },
  logoContainer: {
    marginBottom: 48,
    alignItems: "center",
  },
  logoText: {
    fontSize: 72,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "white",
  },
  logoUnderline: {
    position: "absolute",
    bottom: -12,
    left: 0,
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 2,
  },
  logoUnderlineInner: {
    height: "100%",
    width: "66%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 320,
    gap: 16,
    zIndex: 10,
  },
  buttonOutline: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOutlineText: {
    color: "white",
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 16,
    marginRight: 8,
  },
  buttonFilled: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonFilledText: {
    color: "#712ff7",
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 16,
    marginRight: 8,
  },
  footerText: {
    position: "absolute",
    bottom: 32,
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
  },
})
