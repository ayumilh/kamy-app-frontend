import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { z } from "zod"
import { verifyAuth } from "@/lib/auth"

// Validação para criação de tarefa
const taskSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  assignedTo: z.string().uuid("ID de usuário inválido"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
})

// GET - Obter tarefas de um grupo
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação
    const user = await verifyAuth(req)
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const groupId = params.id

    // Verificar se o usuário é membro do grupo
    const membership = await sql`
      SELECT * FROM group_members 
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `

    if (membership.rows.length === 0) {
      return NextResponse.json({ error: "Acesso negado a este grupo" }, { status: 403 })
    }

    // Buscar tarefas do grupo
    const tasks = await sql`
      SELECT t.*, u.name as assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.group_id = ${groupId}
      ORDER BY t.created_at DESC
    `

    return NextResponse.json({
      tasks: tasks.rows.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        assignedTo: task.assigned_to,
        assignedToName: task.assigned_to_name,
        dueDate: task.due_date,
        status: task.status,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      })),
    })
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}

// POST - Criar nova tarefa
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação
    const user = await verifyAuth(req)
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const groupId = params.id
    const body = await req.json()

    // Validar dados
    const result = taskSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { title, description, assignedTo, dueDate } = result.data

    // Verificar se o usuário é membro do grupo
    const membership = await sql`
      SELECT * FROM group_members 
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `

    if (membership.rows.length === 0) {
      return NextResponse.json({ error: "Acesso negado a este grupo" }, { status: 403 })
    }

    // Verificar se o usuário atribuído é membro do grupo
    const assigneeMembership = await sql`
      SELECT * FROM group_members 
      WHERE group_id = ${groupId} AND user_id = ${assignedTo}
    `

    if (assigneeMembership.rows.length === 0) {
      return NextResponse.json({ error: "Usuário atribuído não é membro do grupo" }, { status: 400 })
    }

    // Criar tarefa
    const newTask = await sql`
      INSERT INTO tasks (title, description, group_id, assigned_to, due_date, status)
      VALUES (${title}, ${description || ""}, ${groupId}, ${assignedTo}, ${dueDate}, 'pending')
      RETURNING id, title, description, group_id, assigned_to, due_date, status, created_at, updated_at
    `

    // Buscar nome do usuário atribuído
    const assignedUser = await sql`
      SELECT name FROM users WHERE id = ${assignedTo}
    `

    return NextResponse.json({
      task: {
        id: newTask.rows[0].id,
        title: newTask.rows[0].title,
        description: newTask.rows[0].description,
        groupId: newTask.rows[0].group_id,
        assignedTo: newTask.rows[0].assigned_to,
        assignedToName: assignedUser.rows[0]?.name,
        dueDate: newTask.rows[0].due_date,
        status: newTask.rows[0].status,
        createdAt: newTask.rows[0].created_at,
        updatedAt: newTask.rows[0].updated_at,
      },
    })
  } catch (error) {
    console.error("Erro ao criar tarefa:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
