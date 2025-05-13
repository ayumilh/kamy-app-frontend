import express from "express"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"
import { z } from "zod"

const router = express.Router()

// Rota para obter dados do usuário atual
router.get("/me", async (req, res) => {
  try {
    const userId = req.user?.id

    // Buscar dados atualizados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }

    // Contar grupos e tarefas pendentes
    const groupsCount = await prisma.groupMember.count({
      where: { userId },
    })

    const pendingTasksCount = await prisma.task.count({
      where: {
        assignedTo: userId,
        status: "pending",
      },
    })

    return res.json({
      user: {
        ...user,
        stats: {
          groupsCount,
          pendingTasksCount,
        },
      },
    })
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Validação para atualização de perfil
const updateProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres").optional(),
})

// Rota para atualizar perfil do usuário
router.put("/me", async (req, res) => {
  try {
    const userId = req.user?.id

    // Validar dados
    const result = updateProfileSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message })
    }

    const { name, email, currentPassword, newPassword } = result.data

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }

    // Preparar dados para atualização
    const updateData: any = {}

    if (name) {
      updateData.name = name
    }

    if (email && email !== user.email) {
      // Verificar se o novo email já está em uso
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return res.status(400).json({ error: "Email já está em uso" })
      }

      updateData.email = email
    }

    // Se estiver alterando a senha
    if (currentPassword && newPassword) {
      // Verificar senha atual
      const passwordMatch = await bcrypt.compare(currentPassword, user.password)

      if (!passwordMatch) {
        return res.status(401).json({ error: "Senha atual incorreta" })
      }

      // Hash da nova senha
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    // Atualizar usuário
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      })
    }

    return res.json({ message: "Perfil atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Rota para atualizar token de push
router.post("/push-token", async (req, res) => {
  try {
    const userId = req.user?.id
    const { pushToken } = req.body

    if (!pushToken) {
      return res.status(400).json({ error: "Token de push é obrigatório" })
    }

    // Atualizar token de push
    await prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    })

    return res.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar token de push:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

export default router
