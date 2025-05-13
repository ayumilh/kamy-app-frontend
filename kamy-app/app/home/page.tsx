"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Bell, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GroupCard } from "@/components/group-card"

const MOCK_GROUPS = [
  {
    id: "1",
    name: "Projeto Website",
    tasks: 8,
    completedTasks: 3,
    members: 4,
    lastActivity: "2h atrás",
  },
  {
    id: "2",
    name: "Marketing Digital",
    tasks: 12,
    completedTasks: 5,
    members: 6,
    lastActivity: "5h atrás",
  },
  {
    id: "3",
    name: "Desenvolvimento App",
    tasks: 15,
    completedTasks: 10,
    members: 3,
    lastActivity: "1d atrás",
  },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")

  const filteredGroups = MOCK_GROUPS.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
      {/* Header */}
      <header className="bg-[#712ff7] text-white p-4 rounded-b-[30px] shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Kamy</h1>
            <p className="text-white/70">Organize. Colabore. Realize.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar grupos..."
            className="w-full bg-white/10 backdrop-blur-md border-none text-white placeholder-white/60 rounded-xl py-6 pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Seus Grupos</h2>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="rounded-full bg-[#712ff7] hover:bg-[#5e21d6] text-white"
          >
            <Plus className="h-5 w-5 mr-1" />
            Novo Grupo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <Link href={`/group/${group.id}`} key={group.id}>
              <GroupCard group={group} />
            </Link>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum grupo encontrado</h3>
            <p className="text-gray-500 max-w-md">
              {searchQuery
                ? `Não encontramos grupos com "${searchQuery}"`
                : "Você ainda não tem grupos. Crie um novo grupo para começar."}
            </p>
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl animate-scaleUp">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Novo Grupo</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome do Grupo</label>
                <Input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full mt-1 rounded-xl"
                  placeholder="Ex: Projeto Website"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-[#712ff7] hover:bg-[#5e21d6] text-white rounded-xl"
                  onClick={() => {
                    // Handle create group
                    setShowCreateModal(false)
                  }}
                >
                  Criar Grupo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
