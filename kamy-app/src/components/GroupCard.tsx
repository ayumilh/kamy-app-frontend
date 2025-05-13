"use client"
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native"
import { Users, Clock, CheckCircle, Circle } from "./Icons"
import { useTheme } from "../contexts/ThemeContext"

interface GroupCardProps {
  group: {
    id: string
    name: string
    tasks: number
    completedTasks: number
    members: number
    lastActivity: string
  }
  onPress: () => void
  style?: ViewStyle
  horizontal?: boolean
}

export function GroupCard({ group, onPress, style, horizontal = false }: GroupCardProps) {
  const { theme } = useTheme()
  const progress = Math.round((group.completedTasks / group.tasks) * 100) || 0

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        horizontal && styles.horizontalContainer,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{group.name}</Text>
        <View style={[styles.membersTag, { backgroundColor: `${theme.colors.primary}20` }]}>
          <Users color={theme.colors.primary} size={12} />
          <Text style={[styles.membersText, { color: theme.colors.primary }]}>{group.members}</Text>
        </View>
      </View>

      <View style={styles.activityRow}>
        <Clock color={theme.dark ? "#999" : "#666"} size={16} />
        <Text style={[styles.activityText, { color: theme.dark ? "#999" : "#666" }]}>
          Última atividade: {group.lastActivity}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Circle color={theme.dark ? "#999" : "#666"} size={16} />
          <Text style={[styles.statusText, { color: theme.dark ? "#999" : "#666" }]}>
            {group.tasks - group.completedTasks} pendentes
          </Text>
        </View>
        <View style={styles.statusItem}>
          <CheckCircle color={theme.colors.success} size={16} />
          <Text style={[styles.statusText, { color: theme.dark ? "#999" : "#666" }]}>
            {group.completedTasks} concluídas
          </Text>
        </View>
      </View>

      <View style={[styles.progressBar, { backgroundColor: theme.dark ? "#333" : "#e5e5e5" }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: `${progress}%` }]} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    marginBottom: 12,
  },
  horizontalContainer: {
    width: 280,
    marginRight: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  membersTag: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  membersText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_500Medium",
    marginLeft: 4,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  activityText: {
    fontSize: 14,
    marginLeft: 6,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    marginLeft: 6,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
})
