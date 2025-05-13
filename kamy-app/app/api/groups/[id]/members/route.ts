import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { z } from "zod"
import { verifyAuth } from "@/lib/auth"

// Validação para adicionar membro
const memberSchema = z.object({
  email: z.string().email("Email inválido"),
})

// GET - Obter membros de um grupo
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

    // Buscar membros do grupo
    const members = await sql`
      SELECT u.id, u.name, u.email, gm.created_at as joined_at,
        CASE WHEN g.owner_id = u.id THEN true ELSE false END as is_owner
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      JOIN groups g ON gm.group_id = g.id
      WHERE gm.group_id = ${groupId}
      ORDER BY is_owner DESC, u.name ASC
    `

    return NextResponse.json({
      members: members.rows.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        joinedAt: member.joined_at,
        isOwner: member.is_owner,
      })),
    })
  } catch (error) {
    console.error("Erro ao buscar membros:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}

// POST - Adicionar membro ao grupo
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
    const result = memberSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { email } = result.data

    // Verificar se o usuário é dono do grupo
    const groupCheck = await sql`
      SELECT * FROM groups 
      WHERE id = ${groupId} AND owner_id = ${user.id}
    `

    if (groupCheck.rows.length === 0) {
      return NextResponse.json({ error: "Apenas o dono do grupo pode adicionar membros" }, { status: 403 })
    }

    // Verificar se o usuário a ser adicionado existe
    const newMember = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (newMember.rows.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário já é membro
    const existingMembership = await sql`
      SELECT * FROM group_members 
      WHERE group_id = ${groupId} AND user_id = ${newMember.rows[0].id}
    `

    if (existingMembership.rows.length > 0) {
      return NextResponse.json({ error: "Usuário já é membro deste grupo" }, { status: 400 })
    }

    // Adicionar membro
    await sql`
      INSERT INTO group_members (group_id, user_id)
      VALUES (${groupId}, ${newMember.rows[0].id})
    `

    return NextResponse.json({
      member: {
        id: newMember.rows[0].id,
        name: newMember.rows[0].name,
        email: newMember.rows[0].email,
        joinedAt: new Date().toISOString(),
        isOwner: false,
      },
    })
  } catch (error) {
    console.error("Erro ao adicionar membro:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
