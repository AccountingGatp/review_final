import type { EmployeeRole } from "@/lib/types"

const USER_ROLE_MAP: Record<string, EmployeeRole> = {
  team_lead: "TEAM_LEAD",
  TEAM_LEAD: "TEAM_LEAD",
  manager: "MANAGER",
  MANAGER: "MANAGER",
  employee: "EMPLOYEE",
  EMPLOYEE: "EMPLOYEE",
}

export function normalizeUserRole(value: string): EmployeeRole | null {
  return USER_ROLE_MAP[value] ?? USER_ROLE_MAP[value.toLowerCase()] ?? null
}

export function canSeeAllEmployees(role: string | undefined | null) {
  const normalized = normalizeUserRole(role ?? "")
  return normalized === "MANAGER" || normalized === "TEAM_LEAD"
}
