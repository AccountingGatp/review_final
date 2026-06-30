import type { AuthUser } from "@/lib/auth-storage"
import type { Employee, EmployeeRole } from "@/lib/types"
import { canSeeAllEmployees, normalizeUserRole } from "@/lib/user"

export function canAddEmployee(user: AuthUser | null) {
  return normalizeUserRole(user?.role ?? "") === "MANAGER"
}

export function canWriteReview(user: AuthUser | null) {
  const role = normalizeUserRole(user?.role ?? "")
  return role === "MANAGER" || role === "TEAM_LEAD"
}

export function canEditEmployee(user: AuthUser | null) {
  return normalizeUserRole(user?.role ?? "") === "MANAGER"
}

export function canDeleteEmployee(user: AuthUser | null) {
  return normalizeUserRole(user?.role ?? "") === "MANAGER"
}

export function getVisibleEmployees(
  employees: Employee[],
  user: AuthUser | null
) {
  if (!user) return []

  if (canSeeAllEmployees(user.role)) {
    return employees
  }

  return employees.filter((employee) => employee.id === user.id)
}

export function getReviewableEmployees(
  employees: Employee[],
  user: AuthUser | null
) {
  if (!user) return []

  const withoutSelf = employees.filter((employee) => employee.id !== user.id)

  const role = normalizeUserRole(user.role)

  if (role === "MANAGER") {
    return withoutSelf.filter(
      (employee) => employee.role === "EMPLOYEE" || employee.role === "TEAM_LEAD"
    )
  }

  if (role === "TEAM_LEAD") {
    return withoutSelf.filter((employee) => employee.role === "EMPLOYEE")
  }

  return []
}

export function getRoleLabel(role: string) {
  const labels: Record<EmployeeRole, string> = {
    TEAM_LEAD: "Team Lead",
    MANAGER: "Manager",
    EMPLOYEE: "Employee",
  }

  if (role in labels) {
    return labels[role as EmployeeRole]
  }

  return role
}
