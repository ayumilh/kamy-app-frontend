import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { z } from "zod"
import { verifyAuth } from "@/lib/auth"

// Validação para criação de grupo
const groupSchema = z.object({
  name: z.string().min(2, "Nome do grupo deve ter pelo menos 2 caracteres"),
})

// GET - Obter grupos do usuário
export async function GET(req: Request) {
  try {
    // Verificar autenticação
    const user = await verifyAuth(req)
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar grupos do usuário
    const groups = await sql`
      SELECT g.*, 
        (SELECT COUNT(*) FROM tasks t WHERE t.group_id = g.id) as tasks_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.group_id = g.id AND t.status = 'done') as completed_tasks_count,
        (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as members_count,
        (SELECT MAX(t.updated_at) FROM tasks t WHERE t.group_id = g.id) as last_activity
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ${user.id}
      ORDER BY g.created_at DESC
    `

    return NextResponse.json({
      groups: groups.rows.map((group) => ({
        id: group.id,
        name: group.name,
        ownerId: group.owner_id,
        tasks: Number.parseInt(group.tasks_count || 0),
        completedTasks: Number.parseInt(group.completed_tasks_count || 0),
        members: Number.parseInt(group.members_count || 0),
        lastActivity: group.last_activity ? new Date(group.last_activity).toISOString() : null,
        createdAt: group.created_at,
      })),
    })
  } catch (error) {
    console.error("Erro ao buscar grupos:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}

// POST - Criar novo grupo
export async function POST(req: Request) {
  try {
    // Verificar autenticação
    const user = await verifyAuth(req)
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()

    // Validar dados
    const result = groupSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { name } = result.data

    // Criar grupo em uma transação
    const newGroup = await sql.begin(async (sql) => {
      // Criar grupo
      const group = await sql`
        INSERT INTO groups (name, owner_id)
        VALUES (${name}, ${user.id})
        RETURNING id, name, owner_id, created_at
      `

      // Adicionar criador como membro
      await sql`
        INSERT INTO group_members (group_id, user_id)
        VALUES (${group.rows[0].id}, ${user.id})
      `

      return group.rows[0]
    })

    return NextResponse.json({
      group: {
        id: newGroup.id,
        name: newGroup.name,
        ownerId: newGroup.owner_id,
        tasks: 0,
        completedTasks: 0,
        members: 1,
        createdAt: newGroup.created_at,
      },
    })
  } catch (error) {
    console.error("Erro ao criar grupo:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
