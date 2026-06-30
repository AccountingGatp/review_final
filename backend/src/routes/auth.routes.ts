import { Router, type Request, type Response } from "express"

import { User } from "../models/User.js"
import { toDbUserRole } from "../types/user.js"
import { isGoogleAuthConfigured, verifyGoogleIdToken } from "../utils/google-auth.js"
import { signToken } from "../utils/jwt.js"

const router = Router()

function formatUser(user: {
  _id: { toString(): string }
  name: string
  email: string
  team: string
  role: string
}) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    team: user.team,
    role: toDbUserRole(user.role),
  }
}

router.post("/login", async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email ?? "")
      .trim()
      .toLowerCase()

    if (!email) {
      res.status(400).json({ message: "Email is required" })
      return
    }

    const user = await User.findOne({ email })

    if (!user) {
      res.status(404).json({ message: "No account found with this email" })
      return
    }

    const dbRole = toDbUserRole(user.role)

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: dbRole,
    })

    res.json({
      message: "Login successful",
      token,
      user: formatUser(user),
    })
  } catch (error) {
    console.error("Login failed:", error)
    res.status(500).json({ message: "Login failed" })
  }
})

router.post("/google", async (req: Request, res: Response) => {
  try {
    if (!isGoogleAuthConfigured()) {
      res.status(503).json({ message: "Google sign-in is not configured" })
      return
    }

    const credential = String(req.body.credential ?? "").trim()

    if (!credential) {
      res.status(400).json({ message: "Google credential is required" })
      return
    }

    const googleUser = await verifyGoogleIdToken(credential)
    const user = await User.findOne({ email: googleUser.email })

    if (!user) {
      res.status(404).json({
        message: "No employee account found for this Google email",
      })
      return
    }

    const dbRole = toDbUserRole(user.role)

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: dbRole,
    })

    res.json({
      message: "Google sign-in successful",
      token,
      user: formatUser(user),
    })
  } catch (error) {
    console.error("Google login failed:", error)
    res.status(401).json({
      message:
        error instanceof Error ? error.message : "Google sign-in failed",
    })
  }
})

export default router
