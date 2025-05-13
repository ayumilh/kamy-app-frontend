import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"

interface UserPayload {
  id: string
  email: string
  name: string
}

export async function verifyAuth(req: Request): Promise<UserPayload | null> {
  try {
    // Tentar obter token do cabeçalho Authorization
    const authHeader = req.headers.get("authorization")
    let token: string | undefined

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    } else {
      // Tentar obter token dos cookies
      const cookieStore = cookies()
      token = cookieStore.get("token")?.value
    }

    if (!token) {
      return null
    }

    // Verificar token
    const decoded = verify(token, process.env.JWT_SECRET || "kamy-secret-key") as UserPayload

    return decoded
  } catch (error) {
    console.error("Erro na verificação de autenticação:", error)
    return null
  }
}
