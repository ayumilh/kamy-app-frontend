import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { verifyAuth } from "@/lib/auth"
import { z } from "zod"

// Validação para token de push
const tokenSchema = z.object({
  pushToken: z.string().min(1, "Token de push é obrigatório"),
})

// POST - Atualizar token de push do usuário
export async function POST(req: Request) {
  try {
    // Verificar autenticação
    const user = await verifyAuth(req)
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()

    // Validar dados
    const result = tokenSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { pushToken } = result.data

    // Atualizar token de push
    await sql`
      UPDATE users
      SET push_token = ${pushToken}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar token de push:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
