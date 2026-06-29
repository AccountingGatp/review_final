import type { NextFunction, Request, Response } from "express"

import { verifyToken, type JwtPayload } from "../utils/jwt.js"
import { normalizeUserRole } from "../types/user.js"

export type AuthenticatedRequest = Request & {
  user?: JwtPayload
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required" })
    return
  }

  const token = header.slice(7)

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    res.status(401).json({ message: "Invalid or expired token" })
  }
}

export function requireManager(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (normalizeUserRole(req.user?.role ?? "") !== "MANAGER") {
    res.status(403).json({ message: "Only managers can perform this action" })
    return
  }

  next()
}
