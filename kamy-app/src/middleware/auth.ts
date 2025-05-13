import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

interface TokenPayload {
  id: string
  email: string
  name: string
}

// Estender o tipo Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token de autenticação não fornecido" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "kamy-secret-key") as TokenPayload
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ error: "Token inválido ou expirado" })
  }
}
