import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { z } from "zod"
import { verifyAuth } from "@/lib/auth"

// Validação para atualização de status
const statusSchema = z.object({
  status: z.enum(["pending", "done"], {
    invalid_type_error: "Status deve ser 'pending' ou 'done'",
  }),
})

// PATCH - Atualizar status da tarefa
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação
    const user = await verifyAuth(req)
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const taskId = params.id
    const body = await req.json()

    // Validar dados
    const result = statusSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { status } = result.data

    // Verificar se a tarefa existe e se o usuário tem acesso
    const taskCheck = await sql`
      SELECT t.* FROM tasks t
      JOIN group_members gm ON t.group_id = gm.group_id
      WHERE t.id = ${taskId} AND gm.user_id = ${user.id}
    `

    if (taskCheck.rows.length === 0) {
      return NextResponse.json({ error: "Tarefa não encontrada ou acesso negado" }, { status: 404 })
    }

    // Atualizar status da tarefa
    const updatedTask = await sql`
      UPDATE tasks
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${taskId}
      RETURNING id, title, description, group_id, assigned_to, due_date, status, created_at, updated_at
    `

    return NextResponse.json({
      task: {
        id: updatedTask.rows[0].id,
        title: updatedTask.rows[0].title,
        description: updatedTask.rows[0].description,
        groupId: updatedTask.rows[0].group_id,
        assignedTo: updatedTask.rows[0].assigned_to,
        dueDate: updatedTask.rows[0].due_date,
        status: updatedTask.rows[0].status,
        createdAt: updatedTask.rows[0].created_at,
        updatedAt: updatedTask.rows[0].updated_at,
      },
    })
  } catch (error) {
    console.error("Erro ao atualizar status da tarefa:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
