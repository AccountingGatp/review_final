"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"

import { loginWithEmail, loginWithGoogle } from "@/lib/auth-api"
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  setAuthSession,
  type AuthUser,
} from "@/lib/auth-storage"

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setToken(getStoredToken())
    setUser(getStoredUser())
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string) => {
    const data = await loginWithEmail(email)
    setAuthSession(data.token, data.user)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const loginWithGoogleCredential = useCallback(async (credential: string) => {
    const data = await loginWithGoogle(credential)
    setAuthSession(data.token, data.user)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      loginWithGoogle: loginWithGoogleCredential,
      logout,
    }),
    [user, token, isLoading, login, loginWithGoogleCredential, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export function useRequireAuth() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace("/login")
    }
  }, [auth.isLoading, auth.isAuthenticated, router])

  return auth
}
