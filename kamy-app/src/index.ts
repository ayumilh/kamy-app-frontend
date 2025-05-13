import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth"
import userRoutes from "./routes/users"
import groupRoutes from "./routes/groups"
import taskRoutes from "./routes/tasks"
import notificationRoutes from "./routes/notifications"
import { authenticateToken } from "./middleware/auth"

// Carregar variáveis de ambiente
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Rotas públicas
app.use("/api/auth", authRoutes)

// Middleware de autenticação para rotas protegidas
app.use("/api", authenticateToken)

// Rotas protegidas
app.use("/api/users", userRoutes)
app.use("/api/groups", groupRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/notifications", notificationRoutes)

// Rota de teste
app.get("/", (req, res) => {
  res.send("API Kamy funcionando!")
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
