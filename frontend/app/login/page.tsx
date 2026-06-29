import { GuestGuard } from "@/components/auth/auth-guard"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <GuestGuard>
      <main className="flex min-h-svh items-center justify-center bg-background p-6">
        <LoginForm />
      </main>
    </GuestGuard>
  )
}
