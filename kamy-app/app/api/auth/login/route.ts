import { NextResponse } from "next/server"
import { compare } from "bcrypt"
import { sql } from "@vercel/postgres"
import { sign } from "jsonwebtoken"
import { z } from "zod"

// Validação de entrada
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validar dados
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { email, password } = result.data

    // Buscar usuário
    const user = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (user.rows.length === 0) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Verificar senha
    const passwordMatch = await compare(password, user.rows[0].password)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Gerar token JWT
    const token = sign(
      {
        id: user.rows[0].id,
        email: user.rows[0].email,
        name: user.rows[0].name,
      },
      process.env.JWT_SECRET || "kamy-secret-key",
      { expiresIn: "7d" },
    )

    return NextResponse.json({
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
      },
      token,
    })
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
