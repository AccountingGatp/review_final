import type { AuthorRole, Employee, ReviewNote } from "@/lib/types"
import { authFetch } from "@/lib/auth-api"
import { API_ENDPOINTS, BASE_URL } from "@/lib/global.js"
import type { PeriodMode } from "@/lib/date-utils"
import { toInputDateValue } from "@/lib/date-utils"

export type NewEmployeePayload = {
  name: string
  role: Employee["role"]
  team: string
  email: string
}

export type NewReviewPayload = {
  employeeId: string
  date: string
  content: string
  rating?: number
}

type ApiUser = Employee

type ApiReview = ReviewNote

type EmployeesResponse = {
  users: ApiUser[]
}

type ReviewsResponse = {
  reviews: ApiReview[]
}

export type UpdateEmployeePayload = NewEmployeePayload

type UpdateEmployeeResponse = {
  message: string
  user: ApiUser
}

type AddEmployeeResponse = UpdateEmployeeResponse

type AddReviewResponse = {
  message: string
  review: ApiReview
}

async function parseError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string }
    return data.message ?? "Something went wrong"
  } catch {
    return "Something went wrong"
  }
}

export async function fetchEmployees(): Promise<Employee[]> {
  const response = await authFetch(`${BASE_URL}${API_ENDPOINTS.employees}`)

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const data = (await response.json()) as EmployeesResponse
  return data.users
}

export async function createEmployee(payload: NewEmployeePayload): Promise<Employee> {
  const response = await authFetch(`${BASE_URL}${API_ENDPOINTS.employees}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const data = (await response.json()) as AddEmployeeResponse
  return data.user
}

export async function updateEmployee(
  id: string,
  payload: UpdateEmployeePayload
): Promise<Employee> {
  const response = await authFetch(`${BASE_URL}${API_ENDPOINTS.employees}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const data = (await response.json()) as UpdateEmployeeResponse
  return data.user
}

export async function deleteEmployee(id: string): Promise<void> {
  const response = await authFetch(`${BASE_URL}${API_ENDPOINTS.employees}/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }
}

export async function fetchReviews(): Promise<ReviewNote[]> {
  const response = await authFetch(`${BASE_URL}${API_ENDPOINTS.reviews}`)

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const data = (await response.json()) as ReviewsResponse
  return data.reviews
}

export async function createReview(payload: NewReviewPayload): Promise<ReviewNote> {
  const response = await authFetch(`${BASE_URL}${API_ENDPOINTS.reviews}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const data = (await response.json()) as AddReviewResponse
  return data.review
}

function getFilenameFromDisposition(header: string | null) {
  if (!header) return "employee-review-report.pdf"
  const match = header.match(/filename="([^"]+)"/)
  return match?.[1] ?? "employee-review-report.pdf"
}

export async function downloadEmployeeReportPdf(
  employeeId: string,
  anchorDate: Date,
  periodMode: PeriodMode
): Promise<void> {
  const params = new URLSearchParams({
    anchorDate: toInputDateValue(anchorDate),
    periodMode,
  })

  const response = await authFetch(
    `${BASE_URL}${API_ENDPOINTS.reports.employeePdf(employeeId)}?${params.toString()}`
  )

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const blob = await response.blob()
  const filename = getFilenameFromDisposition(
    response.headers.get("Content-Disposition")
  )
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
