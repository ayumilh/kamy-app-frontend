import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { verifyAuth } from "@/lib/auth"

// GET - Obter notificações do usuário
export async function GET(req: Request) {
  try {
    // Verificar autenticação
    const user = await verifyAuth(req)
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar notificações do usuário
    const notifications = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 50
    `

    return NextResponse.json({
      notifications: notifications.rows.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        relatedId: notification.related_id,
        createdAt: notification.created_at,
      })),
    })
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
