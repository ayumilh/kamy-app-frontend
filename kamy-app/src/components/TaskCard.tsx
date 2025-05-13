"use client"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { CheckCircle, Circle, Calendar, User } from "./Icons"
import { useTheme } from "../contexts/ThemeContext"

interface TaskCardProps {
  task: {
    id: string
    title: string
    description: string
    assignedTo: string
    assignedToName: string
    dueDate: string
    status: "pending" | "done"
    groupId?: string
    groupName?: string
  }
  onPress?: () => void
  onToggleStatus?: () => void
  showGroup?: boolean
}

export function TaskCard({ task, onPress, onToggleStatus, showGroup = false }: TaskCardProps) {
  const { theme } = useTheme()

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Check if task is overdue
  const isOverdue = () => {
    if (task.status === "done") return false
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    return today > dueDate
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          opacity: task.status === "done" ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {onToggleStatus && (
          <TouchableOpacity onPress={onToggleStatus} style={styles.statusButton}>
            {task.status === "done" ? (
              <CheckCircle color={theme.colors.success} size={24} />
            ) : (
              <Circle color={theme.dark ? "#999" : "#666"} size={24} />
            )}
          </TouchableOpacity>
        )}

        <View style={styles.details}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                textDecorationLine: task.status === "done" ? "line-through" : "none",
                opacity: task.status === "done" ? 0.7 : 1,
              },
            ]}
          >
            {task.title}
          </Text>

          {task.description ? (
            <Text
              style={[
                styles.description,
                {
                  color: theme.dark ? "#999" : "#666",
                  opacity: task.status === "done" ? 0.7 : 1,
                },
              ]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          ) : null}

          {showGroup && task.groupName && (
            <View style={[styles.groupTag, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Text style={[styles.groupText, { color: theme.colors.primary }]}>{task.groupName}</Text>
            </View>
          )}

          <View style={styles.tagsContainer}>
            <View
              style={[
                styles.tag,
                isOverdue()
                  ? [styles.overdueTag, { backgroundColor: `${theme.colors.error}15` }]
                  : task.status === "done"
                    ? [styles.completedTag, { backgroundColor: `${theme.colors.success}15` }]
                    : [styles.pendingTag, { backgroundColor: theme.dark ? "#333" : "#f3f4f6" }],
              ]}
            >
              <Calendar
                color={
                  isOverdue()
                    ? theme.colors.error
                    : task.status === "done"
                      ? theme.colors.success
                      : theme.dark
                        ? "#999"
                        : "#666"
                }
                size={12}
              />
              <Text
                style={[
                  styles.tagText,
                  {
                    color: isOverdue()
                      ? theme.colors.error
                      : task.status === "done"
                        ? theme.colors.success
                        : theme.dark
                          ? "#999"
                          : "#666",
                  },
                ]}
              >
                {formatDate(task.dueDate)}
                {isOverdue() && " (atrasada)"}
              </Text>
            </View>

            <View style={[styles.assigneeTag, { backgroundColor: `${theme.colors.primary}15` }]}>
              <User color={theme.colors.primary} size={12} />
              <Text style={[styles.assigneeText, { color: theme.colors.primary }]}>{task.assignedToName}</Text>
            </View>
          </View>
        </View>
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
  content: {
    flexDirection: "row",
  },
  statusButton: {
    marginTop: 4,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    marginBottom: 12,
  },
  groupTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  groupText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_500Medium",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pendingTag: {
    backgroundColor: "#f3f4f6",
  },
  completedTag: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  overdueTag: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  tagText: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  assigneeTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  assigneeText: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: "SpaceGrotesk_400Regular",
  },
})
