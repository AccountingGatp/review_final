"use client"

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"

import { isGoogleAuthEnabled } from "@/components/auth/google-auth-provider"
import { cn } from "@/lib/utils"

type GoogleSignInButtonProps = {
  onSuccess: (credential: string) => Promise<void>
  disabled?: boolean
}

export function GoogleSignInButton({ onSuccess, disabled }: GoogleSignInButtonProps) {
  if (!isGoogleAuthEnabled()) {
    return null
  }

  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) return
    await onSuccess(response.credential)
  }

  return (
    <div
      className={cn(
        "flex justify-center [&>div]:w-full",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => undefined}
        useOneTap={false}
        theme="outline"
        size="large"
        shape="rectangular"
        text="signin_with"
        width="full"
      />
    </div>
  )
}
