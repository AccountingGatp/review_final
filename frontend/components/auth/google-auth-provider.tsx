"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"
import type { ReactNode } from "react"

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  if (!googleClientId) {
    return children
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
  )
}

export function isGoogleAuthEnabled() {
  return Boolean(googleClientId)
}
