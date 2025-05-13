import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { verifyAuth } from "@/lib/auth"

// PATCH - Marcar notificação como lida
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação
    const user = await verifyAuth(req)
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const notificationId = params.id

    // Verificar se a notificação pertence ao usuário
    const notificationCheck = await sql`
      SELECT * FROM notifications
      WHERE id = ${notificationId} AND user_id = ${user.id}
    `

    if (notificationCheck.rows.length === 0) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    // Marcar como lida
    await sql`
      UPDATE notifications
      SET read = TRUE
      WHERE id = ${notificationId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
