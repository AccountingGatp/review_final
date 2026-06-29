"use client"

import { useState } from "react"
import { Download, Star } from "lucide-react"

import { NoDataFound } from "@/components/no-data-found"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  AUTHOR_ROLE_LABELS,
  EMPLOYEE_ROLE_LABELS,
  type Employee,
  type ReviewNote,
} from "@/lib/types"
import { formatFullDate, type PeriodMode } from "@/lib/date-utils"
import { downloadEmployeeReportPdf } from "@/lib/api"
import { cn } from "@/lib/utils"

import { groupReviewsByDate, type GroupedReviews } from "./employee-list"

const roleBadgeVariant = {
  TEAM_LEAD: "default",
  MANAGER: "secondary",
  PEER: "outline",
} as const

function ReviewCard({ note }: { note: ReviewNote }) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm">{note.authorName}</CardTitle>
            <Badge
              variant={roleBadgeVariant[note.authorRole]}
              className={cn(
                "mt-1",
                note.authorRole === "TEAM_LEAD" &&
                  "bg-violet-500/10 text-violet-700 dark:text-violet-300",
                note.authorRole === "MANAGER" &&
                  "bg-blue-500/10 text-blue-700 dark:text-blue-300",
                note.authorRole === "PEER" &&
                  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              )}
            >
              {AUTHOR_ROLE_LABELS[note.authorRole]}
            </Badge>
          </div>
          {note.rating !== undefined && (
            <Badge variant="outline" className="gap-1 text-amber-600 dark:text-amber-400">
              <Star className="size-3 fill-current" />
              {note.rating}/5
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed">
          {note.content}
        </CardDescription>
      </CardContent>
    </Card>
  )
}

function DateGroup({ group }: { group: GroupedReviews }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        {formatFullDate(group.date)}
      </h3>
      <div className="space-y-3">
        {group.notes.map((note) => (
          <ReviewCard key={note.id} note={note} />
        ))}
      </div>
    </section>
  )
}

type EmployeeDetailProps = {
  employee: Employee
  reviews: ReviewNote[]
  anchorDate: Date
  periodMode: PeriodMode
}

export function EmployeeDetail({
  employee,
  reviews,
  anchorDate,
  periodMode,
}: EmployeeDetailProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const grouped = groupReviewsByDate(reviews)
  const avgRating =
    reviews.filter((r) => r.rating !== undefined).length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
          reviews.filter((r) => r.rating !== undefined).length
        ).toFixed(1)
      : null

  async function handleDownloadReport() {
    setIsDownloading(true)
    setDownloadError(null)

    try {
      await downloadEmployeeReportPdf(employee.id, anchorDate, periodMode)
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Failed to download report"
      )
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{employee.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {EMPLOYEE_ROLE_LABELS[employee.role]}
            </p>
            <p className="text-sm text-muted-foreground">{employee.team}</p>
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReport}
              disabled={isDownloading}
            >
              <Download />
              {isDownloading ? "Generating..." : "Download Report"}
            </Button>
            <Card size="sm" className="min-w-20 text-center">
              <CardHeader className="pb-0">
                <CardDescription>Notes</CardDescription>
                <CardTitle>{reviews.length}</CardTitle>
              </CardHeader>
            </Card>
            {avgRating && (
              <Card size="sm" className="min-w-20 text-center">
                <CardHeader className="pb-0">
                  <CardDescription>Avg rating</CardDescription>
                  <CardTitle>{avgRating}</CardTitle>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
        {downloadError && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {downloadError}
          </p>
        )}
        <Separator className="mt-5" />
      </header>

      <ScrollArea className="flex-1 py-5">
        {grouped.length === 0 ? (
          <NoDataFound
            title="No reviews found"
            description="Try switching to month view or navigating to a different week."
            className="h-48"
          />
        ) : (
          <div className="space-y-8 pr-4">
            {grouped.map((group) => (
              <DateGroup key={group.date} group={group} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
