import type { AuthUser } from "@/lib/auth-storage"
import type { Employee, EmployeeRole } from "@/lib/types"

export function canAddEmployee(user: AuthUser | null) {
  return user?.role === "MANAGER"
}

export function canWriteReview(user: AuthUser | null) {
  return user?.role === "MANAGER" || user?.role === "TEAM_LEAD"
}

export function canEditEmployee(user: AuthUser | null) {
  return user?.role === "MANAGER"
}

export function canDeleteEmployee(user: AuthUser | null) {
  return user?.role === "MANAGER"
}

export function getReviewableEmployees(
  employees: Employee[],
  user: AuthUser | null
) {
  if (!user) return []

  const withoutSelf = employees.filter((employee) => employee.id !== user.id)

  if (user.role === "MANAGER") {
    return withoutSelf.filter(
      (employee) => employee.role === "EMPLOYEE" || employee.role === "TEAM_LEAD"
    )
  }

  if (user.role === "TEAM_LEAD") {
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
