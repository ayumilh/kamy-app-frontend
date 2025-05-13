import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { verifyAuth } from "@/lib/auth"

// GET - Obter dados do usuário atual
export async function GET(req: Request) {
  try {
    // Verificar autenticação
    const user = await verifyAuth(req)
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar dados atualizados do usuário
    const userData = await sql`
      SELECT id, name, email, created_at
      FROM users
      WHERE id = ${user.id}
    `

    if (userData.rows.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Contar grupos e tarefas pendentes
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM group_members WHERE user_id = ${user.id}) as groups_count,
        (SELECT COUNT(*) FROM tasks t 
         JOIN group_members gm ON t.group_id = gm.group_id 
         WHERE gm.user_id = ${user.id} AND t.assigned_to = ${user.id} AND t.status = 'pending') as pending_tasks_count
    `

    return NextResponse.json({
      user: {
        id: userData.rows[0].id,
        name: userData.rows[0].name,
        email: userData.rows[0].email,
        createdAt: userData.rows[0].created_at,
        stats: {
          groupsCount: Number.parseInt(stats.rows[0].groups_count || 0),
          pendingTasksCount: Number.parseInt(stats.rows[0].pending_tasks_count || 0),
        },
      },
    })
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
