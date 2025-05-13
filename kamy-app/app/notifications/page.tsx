"use client"

import Link from "next/link"
import { ArrowLeft, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "task_assigned",
    title: "Nova tarefa atribuída",
    message: "João Silva atribuiu a tarefa 'Criar wireframes da homepage' para você",
    time: "2h atrás",
    read: false,
  },
  {
    id: "2",
    type: "task_completed",
    title: "Tarefa concluída",
    message: "Maria Oliveira concluiu a tarefa 'Design do logo'",
    time: "5h atrás",
    read: false,
  },
  {
    id: "3",
    type: "group_invite",
    title: "Convite para grupo",
    message: "Carlos Mendes convidou você para o grupo 'Marketing Digital'",
    time: "1d atrás",
    read: true,
  },
  {
    id: "4",
    type: "comment",
    title: "Novo comentário",
    message: "Ana Costa comentou na tarefa 'Implementar autenticação'",
    time: "2d atrás",
    read: true,
  },
]

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
      {/* Header */}
      <header className="bg-[#712ff7] text-white p-4 rounded-b-[30px] shadow-lg">
        <div className="flex items-center mb-4">
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
            <h1 className="text-2xl font-bold">Notificações</h1>
            <p className="text-white/70">Mantenha-se atualizado</p>
          </div>
        </div>
      </header>

      {/* Notifications list */}
      <main className="flex-1 p-4">
        <div className="space-y-4">
          {MOCK_NOTIFICATIONS.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${
                notification.read ? "border-gray-300" : "border-[#712ff7]"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    notification.read ? "bg-gray-100" : "bg-[#712ff7]/10"
                  }`}
                >
                  <Bell className={`h-5 w-5 ${notification.read ? "text-gray-500" : "text-[#712ff7]"}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${notification.read ? "text-gray-700" : "text-[#712ff7]"}`}>
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{notification.time}</span>
                    {!notification.read && <span className="text-xs text-[#712ff7] font-medium">Não lida</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
