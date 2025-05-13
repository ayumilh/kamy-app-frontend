import type React from "react"
import { View, Text, TextInput, StyleSheet, type TextInputProps } from "react-native"

interface InputProps extends TextInputProps {
  label?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
}

export function Input({ label, leftIcon, rightIcon, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error ? styles.inputError : null, style]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon ? { paddingLeft: 40 } : null, rightIcon ? { paddingRight: 40 } : null]}
          placeholderTextColor="#999"
          {...rest}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_500Medium",
    color: "#333",
    marginBottom: 6,
  },
  inputContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "#333",
  },
  leftIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  rightIcon: {
    position: "absolute",
    right: 12,
    zIndex: 1,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    fontFamily: "SpaceGrotesk_400Regular",
  },
})
