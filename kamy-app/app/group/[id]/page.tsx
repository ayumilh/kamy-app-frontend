"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Filter, MoreVertical, CheckCircle, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskCard } from "@/components/task-card"

const MOCK_TASKS = [
  {
    id: "1",
    title: "Criar wireframes da homepage",
    description: "Desenvolver os wireframes iniciais para a homepage do site",
    assignedTo: "João Silva",
    dueDate: "2023-05-20",
    status: "pending",
  },
  {
    id: "2",
    title: "Implementar autenticação",
    description: "Adicionar sistema de login e registro usando Firebase Auth",
    assignedTo: "Maria Oliveira",
    dueDate: "2023-05-22",
    status: "pending",
  },
  {
    id: "3",
    title: "Design do logo",
    description: "Criar 3 opções de logo para o cliente escolher",
    assignedTo: "Carlos Mendes",
    dueDate: "2023-05-18",
    status: "done",
  },
  {
    id: "4",
    title: "Configurar banco de dados",
    description: "Configurar estrutura inicial do Firestore",
    assignedTo: "Ana Costa",
    dueDate: "2023-05-15",
    status: "done",
  },
]

export default function GroupPage({ params }: { params: { id: string } }) {
  const [tasks, setTasks] = useState(MOCK_TASKS)
  const [filter, setFilter] = useState("all") // all, pending, done
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    return task.status === filter
  })

  const pendingCount = tasks.filter((task) => task.status === "pending").length
  const completedCount = tasks.filter((task) => task.status === "done").length

  const toggleTaskStatus = (taskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: task.status === "pending" ? "done" : "pending",
          }
        }
        return task
      }),
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
      {/* Header */}
      <header className="bg-[#712ff7] text-white p-4 rounded-b-[30px] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/home">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Projeto Website</h1>
              <p className="text-white/70">4 membros</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-6">
            <div>
              <div className="text-white/70 text-sm">Pendentes</div>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </div>
            <div>
              <div className="text-white/70 text-sm">Concluídas</div>
              <div className="text-2xl font-bold">{completedCount}</div>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="rounded-full bg-white text-[#712ff7] hover:bg-white/90"
          >
            <Plus className="h-5 w-5 mr-1" />
            Nova Tarefa
          </Button>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            className={`rounded-full ${filter === "all" ? "bg-[#712ff7] text-white" : "text-gray-700"}`}
            onClick={() => setFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            className={`rounded-full ${filter === "pending" ? "bg-[#712ff7] text-white" : "text-gray-700"}`}
            onClick={() => setFilter("pending")}
          >
            <Circle className="h-4 w-4 mr-1" />
            Pendentes
          </Button>
          <Button
            variant={filter === "done" ? "default" : "outline"}
            className={`rounded-full ${filter === "done" ? "bg-[#712ff7] text-white" : "text-gray-700"}`}
            onClick={() => setFilter("done")}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Concluídas
          </Button>
        </div>
      </div>

      {/* Task list */}
      <main className="flex-1 p-4">
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggleStatus={() => toggleTaskStatus(task.id)} />
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-500 max-w-md">
              {filter !== "all"
                ? `Não há tarefas ${filter === "pending" ? "pendentes" : "concluídas"}`
                : "Crie uma nova tarefa para começar"}
            </p>
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl animate-scaleUp">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nova Tarefa</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Título</label>
                <Input type="text" className="w-full mt-1 rounded-xl" placeholder="Ex: Criar wireframes" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  className="w-full mt-1 rounded-xl border border-gray-300 focus:border-[#712ff7] focus:ring-[#712ff7] p-2"
                  rows={3}
                  placeholder="Descreva a tarefa..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Data de entrega</label>
                <Input type="date" className="w-full mt-1 rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Atribuir para</label>
                <select className="w-full mt-1 rounded-xl border border-gray-300 focus:border-[#712ff7] focus:ring-[#712ff7] p-2">
                  <option value="">Selecione um membro</option>
                  <option value="1">João Silva</option>
                  <option value="2">Maria Oliveira</option>
                  <option value="3">Carlos Mendes</option>
                  <option value="4">Ana Costa</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-[#712ff7] hover:bg-[#5e21d6] text-white rounded-xl"
                  onClick={() => {
                    // Handle create task
                    setShowCreateModal(false)
                  }}
                >
                  Criar Tarefa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Add this component to avoid errors
const Input = ({ type, className, placeholder, value, onChange }: any) => {
  return <input type={type} className={className} placeholder={placeholder} value={value} onChange={onChange} />
}
