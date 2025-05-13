import express from "express"
import { prisma } from "../lib/prisma"
import { z } from "zod"

const router = express.Router()

// Validação para criação de grupo
const groupSchema = z.object({
  name: z.string().min(2, "Nome do grupo deve ter pelo menos 2 caracteres"),
})

// Rota para obter grupos do usuário
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id

    // Buscar grupos do usuário
    const groupMembers = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: true,
      },
    })

    // Processar dados dos grupos
    const groupsPromises = groupMembers.map(async (membership) => {
      const group = membership.group

      // Contar tarefas
      const tasksCount = await prisma.task.count({
        where: { groupId: group.id },
      })

      const completedTasksCount = await prisma.task.count({
        where: {
          groupId: group.id,
          status: "done",
        },
      })

      // Contar membros
      const membersCount = await prisma.groupMember.count({
        where: { groupId: group.id },
      })

      // Obter última atividade
      const latestTask = await prisma.task.findFirst({
        where: { groupId: group.id },
        orderBy: { updatedAt: "desc" },
      })

      return {
        id: group.id,
        name: group.name,
        ownerId: group.ownerId,
        tasks: tasksCount,
        completedTasks: completedTasksCount,
        members: membersCount,
        lastActivity: latestTask ? latestTask.updatedAt : group.createdAt,
        createdAt: group.createdAt,
      }
    })

    const groups = await Promise.all(groupsPromises)

    // Ordenar por última atividade
    groups.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())

    return res.json({ groups })
  } catch (error) {
    console.error("Erro ao buscar grupos:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Rota para criar novo grupo
router.post("/", async (req, res) => {
  try {
    const userId = req.user?.id

    // Validar dados
    const result = groupSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message })
    }

    const { name } = result.data

    // Criar grupo em uma transação
    const newGroup = await prisma.$transaction(async (prisma) => {
      // Criar grupo
      const group = await prisma.group.create({
        data: {
          name,
          ownerId: userId!,
        },
      })

      // Adicionar criador como membro
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: userId!,
        },
      })

      return group
    })

    return res.status(201).json({
      group: {
        id: newGroup.id,
        name: newGroup.name,
        ownerId: newGroup.ownerId,
        tasks: 0,
        completedTasks: 0,
        members: 1,
        createdAt: newGroup.createdAt,
      },
    })
  } catch (error) {
    console.error("Erro ao criar grupo:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Rota para obter detalhes de um grupo
router.get("/:id", async (req, res) => {
  try {
    const userId = req.user?.id
    const groupId = req.params.id

    // Verificar se o usuário é membro do grupo
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: userId!,
        },
      },
    })

    if (!membership) {
      return res.status(403).json({ error: "Acesso negado a este grupo" })
    }

    // Buscar grupo
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    })

    if (!group) {
      return res.status(404).json({ error: "Grupo não encontrado" })
    }

    // Contar tarefas
    const tasksCount = await prisma.task.count({
      where: { groupId },
    })

    const completedTasksCount = await prisma.task.count({
      where: {
        groupId,
        status: "done",
      },
    })

    // Contar membros
    const membersCount = await prisma.groupMember.count({
      where: { groupId },
    })

    return res.json({
      group: {
        id: group.id,
        name: group.name,
        ownerId: group.ownerId,
        tasks: tasksCount,
        completedTasks: completedTasksCount,
        members: membersCount,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar detalhes do grupo:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Rota para obter membros de um grupo
router.get("/:id/members", async (req, res) => {
  try {
    const userId = req.user?.id
    const groupId = req.params.id

    // Verificar se o usuário é membro do grupo
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: userId!,
        },
      },
    })

    if (!membership) {
      return res.status(403).json({ error: "Acesso negado a este grupo" })
    }

    // Buscar grupo para verificar o dono
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    })

    if (!group) {
      return res.status(404).json({ error: "Grupo não encontrado" })
    }

    // Buscar membros
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    const members = groupMembers.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      joinedAt: member.createdAt,
      isOwner: member.user.id === group.ownerId,
    }))

    // Ordenar: dono primeiro, depois por nome
    members.sort((a, b) => {
      if (a.isOwner) return -1
      if (b.isOwner) return 1
      return a.name.localeCompare(b.name)
    })

    return res.json({ members })
  } catch (error) {
    console.error("Erro ao buscar membros:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Validação para adicionar membro
const memberSchema = z.object({
  email: z.string().email("Email inválido"),
})

// Rota para adicionar membro ao grupo
router.post("/:id/members", async (req, res) => {
  try {
    const userId = req.user?.id
    const groupId = req.params.id

    // Validar dados
    const result = memberSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message })
    }

    const { email } = result.data

    // Verificar se o usuário é dono do grupo
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    })

    if (!group) {
      return res.status(404).json({ error: "Grupo não encontrado" })
    }

    if (group.ownerId !== userId) {
      return res.status(403).json({ error: "Apenas o dono do grupo pode adicionar membros" })
    }

    // Verificar se o usuário a ser adicionado existe
    const newMember = await prisma.user.findUnique({
      where: { email },
    })

    if (!newMember) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }

    // Verificar se o usuário já é membro
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: newMember.id,
        },
      },
    })

    if (existingMembership) {
      return res.status(400).json({ error: "Usuário já é membro deste grupo" })
    }

    // Adicionar membro
    await prisma.groupMember.create({
      data: {
        groupId,
        userId: newMember.id,
      },
    })

    // Criar notificação para o novo membro
    await prisma.notification.create({
      data: {
        userId: newMember.id,
        title: "Convite para grupo",
        message: `Você foi adicionado ao grupo "${group.name}"`,
        type: "group_invite",
        relatedId: groupId,
      },
    })

    return res.status(201).json({
      member: {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        joinedAt: new Date(),
        isOwner: false,
      },
    })
  } catch (error) {
    console.error("Erro ao adicionar membro:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

export default router
