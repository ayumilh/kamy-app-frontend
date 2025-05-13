import express from "express"
import { prisma } from "../lib/prisma"

const router = express.Router()

// Rota para obter notificações do usuário
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id

    // Buscar notificações do usuário
    const notifications = await prisma.notification.findMany({
      where: { userId: userId! },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return res.json({
      notifications: notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        relatedId: notification.relatedId,
        createdAt: notification.createdAt,
      })),
    })
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Rota para marcar notificação como lida
router.patch("/:id/read", async (req, res) => {
  try {
    const userId = req.user?.id
    const notificationId = req.params.id

    // Verificar se a notificação pertence ao usuário
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return res.status(404).json({ error: "Notificação não encontrada" })
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: "Acesso negado a esta notificação" })
    }

    // Marcar como lida
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })

    return res.json({ success: true })
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Rota para marcar todas as notificações como lidas
router.patch("/read-all", async (req, res) => {
  try {
    const userId = req.user?.id

    // Marcar todas as notificações do usuário como lidas
    await prisma.notification.updateMany({
      where: {
        userId: userId!,
        read: false,
      },
      data: { read: true },
    })

    return res.json({ success: true })
  } catch (error) {
    console.error("Erro ao marcar todas notificações como lidas:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

export default router
