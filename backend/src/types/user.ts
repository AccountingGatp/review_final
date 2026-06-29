export const USER_ROLES = ["TEAM_LEAD", "MANAGER", "EMPLOYEE"] as const

export type UserRole = (typeof USER_ROLES)[number]

const USER_ROLE_MAP: Record<string, UserRole> = {
  team_lead: "TEAM_LEAD",
  TEAM_LEAD: "TEAM_LEAD",
  manager: "MANAGER",
  MANAGER: "MANAGER",
  employee: "EMPLOYEE",
  EMPLOYEE: "EMPLOYEE",
}

export function normalizeUserRole(value: string): UserRole | null {
  const normalized = USER_ROLE_MAP[value] ?? USER_ROLE_MAP[value.toLowerCase()]
  return normalized ?? null
}

export function isUserRole(value: string): value is UserRole {
  return normalizeUserRole(value) !== null
}

export function toDbUserRole(value: string): UserRole {
  const role = normalizeUserRole(value)
  if (!role) {
    throw new Error(`Invalid user role: ${value}`)
  }
  return role
}
