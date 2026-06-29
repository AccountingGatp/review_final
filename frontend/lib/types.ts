export type AuthorRole = "TEAM_LEAD" | "MANAGER" | "PEER"

export type EmployeeRole = "TEAM_LEAD" | "MANAGER" | "EMPLOYEE"

export type EmployeeMeta = {
  userId: string
  name: string
  email: string
  role?: string
}

export type Employee = {
  id: string
  name: string
  role: EmployeeRole
  team: string
  email: string
  createdBy?: EmployeeMeta
  teamLead?: Omit<EmployeeMeta, "role">
}

export type ReviewNote = {
  id: string
  employeeId: string
  reviewBy?: string
  authorName: string
  authorRole: AuthorRole
  date: string
  content: string
  rating?: number
}

export const AUTHOR_ROLE_LABELS: Record<AuthorRole, string> = {
  TEAM_LEAD: "Team Lead",
  MANAGER: "Manager",
  PEER: "Peer",
}

export const AUTHOR_ROLE_OPTIONS: { value: AuthorRole; label: string }[] = [
  { value: "TEAM_LEAD", label: "Team Lead" },
  { value: "MANAGER", label: "Manager" },
  { value: "PEER", label: "Peer" },
]

export const EMPLOYEE_ROLE_LABELS: Record<EmployeeRole, string> = {
  TEAM_LEAD: "Team Lead",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
}

export const EMPLOYEE_ROLE_OPTIONS: { value: EmployeeRole; label: string }[] = [
  { value: "TEAM_LEAD", label: "Team Lead" },
  { value: "MANAGER", label: "Manager" },
  { value: "EMPLOYEE", label: "Employee" },
]
