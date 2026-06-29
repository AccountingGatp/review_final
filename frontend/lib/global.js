export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://review-final-api.vercel.app"

export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
  },
  employees: "/api/employees",
  reviews: "/api/reviews",
}
