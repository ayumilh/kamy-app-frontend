import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { sql } from "@vercel/postgres"
import { z } from "zod"

// Validação de entrada
const userSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validar dados
    const result = userSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { name, email, password } = result.data

    // Verificar se o usuário já existe
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await hash(password, 10)

    // Criar usuário
    const newUser = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id, name, email, created_at
    `

    return NextResponse.json({
      user: {
        id: newUser.rows[0].id,
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
        createdAt: newUser.rows[0].created_at,
      },
    })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
