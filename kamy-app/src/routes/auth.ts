import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma"
import { z } from "zod"

const router = express.Router()

// Validação para registro
const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

// Rota de registro
router.post("/register", async (req, res) => {
  try {
    // Validar dados
    const result = registerSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message })
    }

    const { name, email, password } = result.data

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      process.env.JWT_SECRET || "kamy-secret-key",
      { expiresIn: "7d" },
    )

    return res.status(201).json({
      user: newUser,
      token,
    })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Validação para login
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

// Rota de login
router.post("/login", async (req, res) => {
  try {
    // Validar dados
    const result = loginSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message })
    }

    const { email, password } = result.data

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" })
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciais inválidas" })
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || "kamy-secret-key",
      { expiresIn: "7d" },
    )

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    })
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

// Rota para recuperação de senha
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório" })
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Por segurança, não informamos se o email existe ou não
      return res
        .status(200)
        .json({ message: "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha." })
    }

    // Aqui você implementaria o envio de email com link para redefinição de senha
    // Por simplicidade, apenas retornamos uma mensagem de sucesso

    return res
      .status(200)
      .json({ message: "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha." })
  } catch (error) {
    console.error("Erro ao processar recuperação de senha:", error)
    return res.status(500).json({ error: "Erro ao processar solicitação" })
  }
})

export default router
