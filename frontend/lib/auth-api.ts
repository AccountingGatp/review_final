import type { AuthUser } from "@/lib/auth-storage"
import { getStoredToken } from "@/lib/auth-storage"
import { API_ENDPOINTS, BASE_URL } from "@/lib/global.js"

export type LoginResponse = {
  message: string
  token: string
  user: AuthUser
}

async function parseError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string }
    return data.message ?? "Something went wrong"
  } catch {
    return "Something went wrong"
  }
}

export async function loginWithEmail(email: string): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.auth.login}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json() as Promise<LoginResponse>
}

export async function loginWithGoogle(credential: string): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.auth.google}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json() as Promise<LoginResponse>
}

export async function authFetch(input: string, init: RequestInit = {}) {
  const token = getStoredToken()
  const headers = new Headers(init.headers)

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  return fetch(input, {
    ...init,
    headers,
  })
}
