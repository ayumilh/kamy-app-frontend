import { Users, Clock, CheckCircle, Circle } from "lucide-react"

interface GroupCardProps {
  group: {
    id: string
    name: string
    tasks: number
    completedTasks: number
    members: number
    lastActivity: string
  }
}

export function GroupCard({ group }: GroupCardProps) {
  const progress = Math.round((group.completedTasks / group.tasks) * 100) || 0

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/50 hover:shadow-md transition-all hover:translate-y-[-2px] cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-800 text-lg">{group.name}</h3>
        <div className="bg-[#712ff7]/10 text-[#712ff7] text-xs font-medium rounded-full px-2 py-1 flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {group.members}
        </div>
      </div>

      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Clock className="h-4 w-4 mr-1" />
        <span>Última atividade: {group.lastActivity}</span>
      </div>

      <div className="flex justify-between items-center text-sm mb-2">
        <div className="flex items-center">
          <Circle className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-gray-600">{group.tasks - group.completedTasks} pendentes</span>
        </div>
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-gray-600">{group.completedTasks} concluídas</span>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div className="bg-[#712ff7] h-2 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}
