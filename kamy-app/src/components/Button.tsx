import type React from "react"
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  type ViewStyle,
  type TextStyle,
} from "react-native"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const getContainerStyle = () => {
    const baseStyle = [styles.container]

    // Variant styles
    if (variant === "primary") {
      baseStyle.push(styles.primaryContainer)
    } else if (variant === "secondary") {
      baseStyle.push(styles.secondaryContainer)
    } else if (variant === "outline") {
      baseStyle.push(styles.outlineContainer)
    } else if (variant === "ghost") {
      baseStyle.push(styles.ghostContainer)
    }

    // Size styles
    if (size === "sm") {
      baseStyle.push(styles.smallContainer)
    } else if (size === "lg") {
      baseStyle.push(styles.largeContainer)
    }

    // Disabled style
    if (disabled) {
      baseStyle.push(styles.disabledContainer)
    }

    return baseStyle
  }

  const getTextStyle = () => {
    const baseStyle = [styles.text]

    // Variant text styles
    if (variant === "primary") {
      baseStyle.push(styles.primaryText)
    } else if (variant === "secondary") {
      baseStyle.push(styles.secondaryText)
    } else if (variant === "outline") {
      baseStyle.push(styles.outlineText)
    } else if (variant === "ghost") {
      baseStyle.push(styles.ghostText)
    }

    // Size text styles
    if (size === "sm") {
      baseStyle.push(styles.smallText)
    } else if (size === "lg") {
      baseStyle.push(styles.largeText)
    }

    // Disabled text style
    if (disabled) {
      baseStyle.push(styles.disabledText)
    }

    return baseStyle
  }

  return (
    <TouchableOpacity
      style={[...getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#712ff7"} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  primaryContainer: {
    backgroundColor: "#712ff7",
  },
  secondaryContainer: {
    backgroundColor: "#fff",
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#712ff7",
  },
  ghostContainer: {
    backgroundColor: "transparent",
  },
  smallContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  largeContainer: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  text: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 16,
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#712ff7",
  },
  outlineText: {
    color: "#712ff7",
  },
  ghostText: {
    color: "#712ff7",
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.7,
  },
})
