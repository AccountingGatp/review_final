"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { WriteReviewForm } from "@/components/reviews/write-review-form"
import { useAuth } from "@/hooks/use-auth"
import { canWriteReview } from "@/lib/permissions"

export function WriteReviewView() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !canWriteReview(user)) {
      router.replace("/")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!canWriteReview(user)) {
    return null
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div>
          <h1 className="text-lg font-semibold">Write Review</h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === "MANAGER"
              ? "Managers can review employees and team leads."
              : "Team leads can review employees only."}
          </p>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <WriteReviewForm />
      </main>
    </>
  )
}
