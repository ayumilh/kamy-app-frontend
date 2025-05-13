"use client"

import { CheckCircle, Circle, Calendar, User } from "lucide-react"

interface TaskCardProps {
  task: {
    id: string
    title: string
    description: string
    assignedTo: string
    dueDate: string
    status: "pending" | "done"
  }
  onToggleStatus: () => void
}

export function TaskCard({ task, onToggleStatus }: TaskCardProps) {
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
    <div
      className={`bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/50 ${
        task.status === "done" ? "opacity-80" : ""
      }`}
    >
      <div className="flex items-start">
        <button
          onClick={onToggleStatus}
          className={`mt-1 mr-3 flex-shrink-0 ${
            task.status === "done" ? "text-green-500" : "text-gray-400 hover:text-[#712ff7]"
          }`}
        >
          {task.status === "done" ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
        </button>

        <div className="flex-1">
          <h3
            className={`font-medium text-lg ${task.status === "done" ? "text-gray-500 line-through" : "text-gray-800"}`}
          >
            {task.title}
          </h3>
          <p className={`text-sm mt-1 ${task.status === "done" ? "text-gray-400" : "text-gray-600"}`}>
            {task.description}
          </p>

          <div className="flex flex-wrap items-center mt-3 gap-3">
            <div
              className={`flex items-center text-xs rounded-full px-2 py-1 ${
                isOverdue()
                  ? "bg-red-100 text-red-600"
                  : task.status === "done"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(task.dueDate)}
              {isOverdue() && " (atrasada)"}
            </div>

            <div className="flex items-center text-xs bg-[#712ff7]/10 text-[#712ff7] rounded-full px-2 py-1">
              <User className="h-3 w-3 mr-1" />
              {task.assignedTo}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
