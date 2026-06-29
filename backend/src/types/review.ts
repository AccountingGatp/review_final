export const AUTHOR_ROLES = ["TEAM_LEAD", "MANAGER", "PEER"] as const

export type AuthorRole = (typeof AUTHOR_ROLES)[number]

const AUTHOR_ROLE_MAP: Record<string, AuthorRole> = {
  team_lead: "TEAM_LEAD",
  TEAM_LEAD: "TEAM_LEAD",
  manager: "MANAGER",
  MANAGER: "MANAGER",
  peer: "PEER",
  PEER: "PEER",
}

export function normalizeAuthorRole(value: string): AuthorRole | null {
  const normalized = AUTHOR_ROLE_MAP[value] ?? AUTHOR_ROLE_MAP[value.toLowerCase()]
  return normalized ?? null
}

export function isAuthorRole(value: string): value is AuthorRole {
  return normalizeAuthorRole(value) !== null
}

export function toDbAuthorRole(value: string): AuthorRole {
  const role = normalizeAuthorRole(value)
  if (!role) {
    throw new Error(`Invalid author role: ${value}`)
  }
  return role
}

export function userRoleToAuthorRole(role: string): AuthorRole {
  const normalized = role.toUpperCase()

  if (normalized === "TEAM_LEAD") return "TEAM_LEAD"
  if (normalized === "MANAGER") return "MANAGER"
  return "PEER"
}
