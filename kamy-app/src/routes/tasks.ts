import express from "express"
import { prisma } from "../lib/prisma"
import { z } from "zod"

const router = express.Router()

// Validação para criação de tarefa
const taskSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  groupId: z.string().uuid("ID de grupo inválido"),
  assignedTo: z.string().uuid("ID de usuário inválido"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
})

// Rota para obter tarefas de um grupo
router.get("/group/:groupId", async (req, res) => {
  try {
    const userId = req.user?.id
    const groupId = req.params.groupId

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

    // Buscar tarefas do grupo
    const tasks = await prisma.task.findMany({
      where: { groupId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return res.json({
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        assignedToName: task.assignee.name,
        dueDate: task.dueDate.toISOString().split("T")[0],
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    })
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Rota para obter tarefas do usuário
router.get("/my-tasks", async (req, res) => {
  try {
    const userId = req.user?.id

    // Buscar tarefas atribuídas ao usuário
    const tasks = await prisma.task.findMany({
      where: { assignedTo: userId! },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // Pendentes primeiro
        { dueDate: "asc" }, // Ordenar por data de entrega
      ],
    })

    return res.json({
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        groupId: task.groupId,
        groupName: task.group.name,
        dueDate: task.dueDate.toISOString().split("T")[0],
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    })
  } catch (error) {
    console.error("Erro ao buscar tarefas do usuário:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Rota para criar nova tarefa
router.post("/", async (req, res) => {
  try {
    const userId = req.user?.id

    // Validar dados
    const result = taskSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message })
    }

    const { title, description, groupId, assignedTo, dueDate } = result.data

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

    // Verificar se o usuário atribuído é membro do grupo
    const assigneeMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: assignedTo,
        },
      },
    })

    if (!assigneeMembership) {
      return res.status(400).json({ error: "Usuário atribuído não é membro do grupo" })
    }

    // Criar tarefa
    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || "",
        groupId,
        assignedTo,
        createdBy: userId!,
        dueDate: new Date(dueDate),
        status: "pending",
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Atualizar timestamp do grupo
    await prisma.group.update({
      where: { id: groupId },
      data: { updatedAt: new Date() },
    })

    // Criar notificação para o usuário atribuído (se não for o criador)
    if (assignedTo !== userId) {
      await prisma.notification.create({
        data: {
          userId: assignedTo,
          title: "Nova tarefa atribuída",
          message: `Você recebeu uma nova tarefa: ${title}`,
          type: "task_assigned",
          relatedId: newTask.id,
        },
      })
    }

    return res.status(201).json({
      task: {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        groupId: newTask.groupId,
        assignedTo: newTask.assignedTo,
        assignedToName: newTask.assignee.name,
        dueDate: newTask.dueDate.toISOString().split("T")[0],
        status: newTask.status,
        createdAt: newTask.createdAt,
        updatedAt: newTask.updatedAt,
      },
    })
  } catch (error) {
    console.error("Erro ao criar tarefa:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Rota para obter detalhes de uma tarefa
router.get("/:id", async (req, res) => {
  try {
    const userId = req.user?.id
    const taskId = req.params.id

    // Buscar tarefa
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        group: true,
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" })
    }

    // Verificar se o usuário é membro do grupo
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: task.groupId,
          userId: userId!,
        },
      },
    })

    if (!membership) {
      return res.status(403).json({ error: "Acesso negado a esta tarefa" })
    }

    return res.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        groupId: task.groupId,
        groupName: task.group.name,
        assignedTo: task.assignedTo,
        assignedToName: task.assignee.name,
        createdBy: task.createdBy,
        createdByName: task.creator.name,
        dueDate: task.dueDate.toISOString().split("T")[0],
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar detalhes da tarefa:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Validação para atualização de status
const statusSchema = z.object({
  status: z.enum(["pending", "done"], {
    invalid_type_error: "Status deve ser 'pending' ou 'done'",
  }),
})

// Rota para atualizar status da tarefa
router.patch("/:id/status", async (req, res) => {
  try {
    const userId = req.user?.id
    const taskId = req.params.id

    // Validar dados
    const result = statusSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message })
    }

    const { status } = result.data

    // Buscar tarefa
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        group: true,
      },
    })

    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" })
    }

    // Verificar se o usuário é membro do grupo
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: task.groupId,
          userId: userId!,
        },
      },
    })

    if (!membership) {
      return res.status(403).json({ error: "Acesso negado a esta tarefa" })
    }

    // Atualizar status da tarefa
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        updatedAt: new Date(),
      },
    })

    // Atualizar timestamp do grupo
    await prisma.group.update({
      where: { id: task.groupId },
      data: { updatedAt: new Date() },
    })

    // Se a tarefa foi concluída e não foi o próprio usuário atribuído que a concluiu
    if (status === "done" && task.assignedTo !== userId) {
      // Criar notificação para o usuário atribuído
      await prisma.notification.create({
        data: {
          userId: task.assignedTo,
          title: "Tarefa concluída",
          message: `A tarefa "${task.title}" foi marcada como concluída`,
          type: "task_completed",
          relatedId: taskId,
        },
      })
    }

    return res.json({
      task: {
        id: updatedTask.id,
        status: updatedTask.status,
        updatedAt: updatedTask.updatedAt,
      },
    })
  } catch (error) {
    console.error("Erro ao atualizar status da tarefa:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

export default router
