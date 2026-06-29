"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { NoDataFound } from "@/components/no-data-found"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useReviews } from "@/hooks/use-reviews"
import { AUTHOR_ROLE_LABELS } from "@/lib/types"
import { formatFullDate } from "@/lib/date-utils"

export function ReviewsView() {
  const { reviews, isLoading, error } = useReviews()
  const sorted = [...reviews].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Button variant="ghost" size="icon-sm" render={<Link href="/" />}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">All Reviews</h1>
          <p className="text-sm text-muted-foreground">
            All review entries from the database.
          </p>
        </div>
      </header>

      <main className="flex-1 space-y-3 p-4 md:p-6">
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading reviews...</p>
        ) : sorted.length === 0 ? (
          <NoDataFound
            title="No reviews found"
            description="Write the first review to get started."
          />
        ) : (
          sorted.map((note) => (
            <Card key={note.id} size="sm">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">{note.authorName}</CardTitle>
                    <Badge variant="secondary">
                      {AUTHOR_ROLE_LABELS[note.authorRole]}
                    </Badge>
                  </div>
                  <CardDescription>{formatFullDate(note.date)}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {note.content}
                </CardDescription>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </>
  )
}

export default function ReviewsPageWrapper() {
  return (
    <DashboardShell>
      <ReviewsView />
    </DashboardShell>
  )
}
