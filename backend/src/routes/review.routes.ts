import { Router, type Response } from "express"

import {
  authenticate,
  type AuthenticatedRequest,
} from "../middleware/auth.js"
import { Review, type ReviewDocument } from "../models/Review.js"
import { User } from "../models/User.js"
import {
  canReviewTarget,
  canWriteReview,
} from "../utils/review-permissions.js"
import {
  normalizeAuthorRole,
  toDbAuthorRole,
  userRoleToAuthorRole,
} from "../types/review.js"
import { normalizeUserRole, toDbUserRole } from "../types/user.js"

const router = Router()

function formatReview(review: ReviewDocument) {
  return {
    id: review._id.toString(),
    employeeId: review.employeeId,
    reviewBy: review.reviewBy ?? undefined,
    authorName: review.authorName ?? "Unknown",
    authorRole: review.authorRole
      ? toDbAuthorRole(String(review.authorRole))
      : "PEER",
    date: review.date,
    content: review.content,
    rating: review.rating ?? undefined,
  }
}

router.get("/", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" })
      return
    }

    const role = normalizeUserRole(req.user.role)
    const query =
      role === "MANAGER" || role === "TEAM_LEAD"
        ? {}
        : { employeeId: req.user.userId }

    const reviews = await Review.find(query).sort({ date: -1, createdAt: -1 })
    res.json({ reviews: reviews.map(formatReview) })
  } catch (error) {
    console.error("Failed to fetch reviews:", error)
    res.status(500).json({ message: "Failed to fetch reviews" })
  }
})

router.post("/", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = String(req.body.employeeId ?? "").trim()
    const date = String(req.body.date ?? "").trim()
    const content = String(req.body.content ?? "").trim()
    const rating =
      req.body.rating === undefined || req.body.rating === null || req.body.rating === ""
        ? undefined
        : Number(req.body.rating)

    if (!employeeId || !date || !content) {
      res.status(400).json({
        message: "Employee, date, and content are required",
      })
      return
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ message: "Date must be in YYYY-MM-DD format" })
      return
    }

    if (rating !== undefined && (Number.isNaN(rating) || rating < 1 || rating > 5)) {
      res.status(400).json({ message: "Rating must be between 1 and 5" })
      return
    }

    if (!req.user) {
      res.status(401).json({ message: "Authentication required" })
      return
    }

    if (!canWriteReview(req.user.role)) {
      res.status(403).json({ message: "Employees cannot add reviews" })
      return
    }

    const employee = await User.findById(employeeId)
    if (!employee) {
      res.status(404).json({ message: "Employee not found" })
      return
    }

    const targetRole = toDbUserRole(String(employee.role))

    if (!canReviewTarget(req.user.role, targetRole)) {
      res.status(403).json({
        message:
          "Team leads can only review employees. Managers can review employees and team leads.",
      })
      return
    }

    const reviewer = await User.findById(req.user.userId)
    if (!reviewer) {
      res.status(404).json({ message: "Logged-in user not found" })
      return
    }

    const authorRole = userRoleToAuthorRole(String(reviewer.role))

    const review = await Review.create({
      employeeId,
      reviewBy: req.user.userId,
      authorName: reviewer.name,
      authorRole: normalizeAuthorRole(authorRole) ?? authorRole,
      date,
      content,
      rating,
    })

    res.status(201).json({
      message: "Review added successfully",
      review: formatReview(review),
    })
  } catch (error) {
    console.error("Failed to add review:", error)
    res.status(500).json({ message: "Failed to add review" })
  }
})

export default router
