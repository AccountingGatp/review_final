"use client"

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { useEffect, useRef, useState } from "react"

import { isGoogleAuthEnabled } from "@/components/auth/google-auth-provider"
import { cn } from "@/lib/utils"

type GoogleSignInButtonProps = {
  onSuccess: (credential: string) => Promise<void>
  disabled?: boolean
}

export function GoogleSignInButton({ onSuccess, disabled }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [buttonWidth, setButtonWidth] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function updateWidth() {
      setButtonWidth(container.offsetWidth)
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  if (!isGoogleAuthEnabled()) {
    return null
  }

  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) return
    await onSuccess(response.credential)
  }

  return (
    <div
      ref={containerRef}
      className={cn("w-full", disabled && "pointer-events-none opacity-60")}
    >
      {buttonWidth > 0 && (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => undefined}
          useOneTap={false}
          theme="outline"
          size="large"
          shape="rectangular"
          text="signin_with"
          width={buttonWidth}
        />
      )}
    </div>
  )
}
