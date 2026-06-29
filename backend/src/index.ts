import "dotenv/config"

import cors from "cors"
import express from "express"

import { connectDB } from "./config/db.js"
import authRoutes from "./routes/auth.routes.js"
import employeeRoutes from "./routes/employee.routes.js"
import reviewRoutes from "./routes/review.routes.js"

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(cors())
app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/auth", authRoutes)
app.use("/api/employees", employeeRoutes)
app.use("/api/reviews", reviewRoutes)

async function startServer() {
  try {
    await connectDB()
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
