export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
  },
  employees: "/api/employees",
  reviews: "/api/reviews",
}
