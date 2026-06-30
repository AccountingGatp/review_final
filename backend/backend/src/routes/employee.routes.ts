import { Router, type Response } from "express"

import {
  authenticate,
  requireManager,
  type AuthenticatedRequest,
} from "../middleware/auth.js"
import { User, type UserDocument } from "../models/User.js"
import { Review } from "../models/Review.js"
import { isUserRole, normalizeUserRole, toDbUserRole } from "../types/user.js"

const router = Router()

function formatUser(user: UserDocument) {
  const role = toDbUserRole(String(user.role))

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    team: user.team,
    role,
    createdBy: user.createdBy?.userId
      ? {
          userId: user.createdBy.userId,
          name: user.createdBy.name ?? "",
          email: user.createdBy.email ?? "",
          role: user.createdBy.role
            ? normalizeUserRole(String(user.createdBy.role)) ?? undefined
            : undefined,
        }
      : undefined,
    teamLead: user.teamLead?.userId
      ? {
          userId: user.teamLead.userId,
          name: user.teamLead.name ?? "",
          email: user.teamLead.email ?? "",
        }
      : undefined,
  }
}

router.get("/", async (_req, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({ users: users.map(formatUser) })
  } catch (error) {
    console.error("Failed to fetch employees:", error)
    res.status(500).json({ message: "Failed to fetch employees" })
  }
})

router.post(
  "/",
  authenticate,
  requireManager,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const name = String(req.body.name ?? "").trim()
      const email = String(req.body.email ?? "").trim().toLowerCase()
      const team = String(req.body.team ?? "").trim()
      const role = String(req.body.role ?? "").trim()

      if (!name || !email || !team || !role) {
        res.status(400).json({
          message: "Name, email, team, and role are required",
        })
        return
      }

      if (!isUserRole(role)) {
        res.status(400).json({
          message: "Role must be one of: TEAM_LEAD, MANAGER, EMPLOYEE",
        })
        return
      }

      const dbRole = toDbUserRole(role)

      const existingUser = await User.findOne({ email })
      if (existingUser) {
        res.status(409).json({ message: "A user with this email already exists" })
        return
      }

      if (!req.user) {
        res.status(401).json({ message: "Authentication required" })
        return
      }

      const user = await User.create({
        name,
        email,
        team,
        role: dbRole,
        createdBy: {
          userId: req.user.userId,
          name: req.user.name,
          email: req.user.email,
          role: toDbUserRole(req.user.role),
        },
      })

      res.status(201).json({
        message: "Employee added successfully",
        user: formatUser(user),
      })
    } catch (error) {
      console.error("Failed to add employee:", error)
      res.status(500).json({ message: "Failed to add employee" })
    }
  }
)

router.put(
  "/:id",
  authenticate,
  requireManager,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = String(req.params.id ?? "").trim()
      const name = String(req.body.name ?? "").trim()
      const email = String(req.body.email ?? "").trim().toLowerCase()
      const team = String(req.body.team ?? "").trim()
      const role = String(req.body.role ?? "").trim()

      if (!userId) {
        res.status(400).json({ message: "Employee id is required" })
        return
      }

      if (!name || !email || !team || !role) {
        res.status(400).json({
          message: "Name, email, team, and role are required",
        })
        return
      }

      if (!isUserRole(role)) {
        res.status(400).json({
          message: "Role must be one of: TEAM_LEAD, MANAGER, EMPLOYEE",
        })
        return
      }

      const user = await User.findById(userId)
      if (!user) {
        res.status(404).json({ message: "Employee not found" })
        return
      }

      const duplicateEmail = await User.findOne({ email, _id: { $ne: userId } })
      if (duplicateEmail) {
        res.status(409).json({ message: "A user with this email already exists" })
        return
      }

      user.name = name
      user.email = email
      user.team = team
      user.role = toDbUserRole(role)

      await user.save()

      res.json({
        message: "Employee updated successfully",
        user: formatUser(user),
      })
    } catch (error) {
      console.error("Failed to update employee:", error)
      res.status(500).json({ message: "Failed to update employee" })
    }
  }
)

router.delete(
  "/:id",
  authenticate,
  requireManager,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = String(req.params.id ?? "").trim()

      if (!userId) {
        res.status(400).json({ message: "Employee id is required" })
        return
      }

      if (req.user?.userId === userId) {
        res.status(400).json({ message: "You cannot delete your own account" })
        return
      }

      const user = await User.findById(userId)
      if (!user) {
        res.status(404).json({ message: "Employee not found" })
        return
      }

      await Review.deleteMany({
        $or: [{ employeeId: userId }, { reviewBy: userId }],
      })

      await User.findByIdAndDelete(userId)

      res.json({
        message: "Employee and related reviews deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete employee:", error)
      res.status(500).json({ message: "Failed to delete employee" })
    }
  }
)

export default router
