import { normalizeUserRole, type UserRole } from "../types/user.js"

export function canWriteReview(role: string): boolean {
  const normalized = normalizeUserRole(role)
  return normalized === "MANAGER" || normalized === "TEAM_LEAD"
}

export function canReviewTarget(
  reviewerRole: string,
  targetRole: string
): boolean {
  const reviewer = normalizeUserRole(reviewerRole)
  const target = normalizeUserRole(targetRole)

  if (!reviewer || !target) return false
  if (reviewer === "EMPLOYEE") return false
  if (reviewer === "TEAM_LEAD") return target === "EMPLOYEE"
  if (reviewer === "MANAGER") {
    return target === "EMPLOYEE" || target === "TEAM_LEAD"
  }

  return false
}
