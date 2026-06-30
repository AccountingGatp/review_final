import type { Types } from "mongoose"

import { Review } from "../models/Review.js"
import { User, type UserDocument } from "../models/User.js"
import { toDbAuthorRole } from "../types/review.js"
import { toDbUserRole } from "../types/user.js"
import {
  formatPeriodLabel,
  isWithinPeriod,
  parseAnchorDate,
  toInputDateValue,
} from "../utils/date-utils.js"
import {
  buildEmployeeReportFilename,
  buildEmployeeReportPdf,
  type ReportReview,
} from "../utils/employee-report-pdf.js"
import { isSlackConfigured, postSlackMessage, uploadPdfToSlack } from "../utils/slack-client.js"

type WeeklySlackReportResult = {
  periodLabel: string
  anchorDate: string
  sent: Array<{ employeeId: string; name: string; email: string; filename: string; reviewCount: number }>
  skipped: Array<{ employeeId: string; name: string; email: string; reason: string }>
  failed: Array<{ employeeId: string; name: string; email: string; error: string }>
}

function formatReviewsForReport(reviews: Array<{
  date: string
  authorName?: string | null
  authorRole?: string | null
  content: string
  rating?: number | null
}>): ReportReview[] {
  return reviews.map((review) => ({
    date: review.date,
    authorName: review.authorName ?? "Unknown",
    authorRole: review.authorRole
      ? toDbAuthorRole(String(review.authorRole))
      : "PEER",
    content: review.content,
    rating: review.rating ?? undefined,
  }))
}

function formatEmployeeForReport(user: UserDocument) {
  return {
    name: user.name,
    email: user.email,
    team: user.team,
    role: toDbUserRole(String(user.role)),
    teamLeadName: user.teamLead?.name ?? undefined,
  }
}

function getEmployeeId(user: UserDocument) {
  return (user._id as Types.ObjectId).toString()
}

export async function sendWeeklyReportsToSlack(
  anchorDateInput?: string
): Promise<WeeklySlackReportResult> {
  if (!isSlackConfigured()) {
    throw new Error("Slack is not configured. Set SLACK_BOT_TOKEN and SLACK_CHANNEL_ID.")
  }

  const anchorDate =
    parseAnchorDate(anchorDateInput ?? "") ?? parseAnchorDate(toInputDateValue(new Date()))

  if (!anchorDate) {
    throw new Error("anchorDate must be in YYYY-MM-DD format")
  }

  const periodLabel = formatPeriodLabel(anchorDate, "week")
  const users = await User.find().sort({ name: 1 })
  const reviews = await Review.find().sort({ date: -1, createdAt: -1 })

  const reviewsByEmployee = new Map<string, typeof reviews>()

  for (const review of reviews) {
    if (!isWithinPeriod(review.date, anchorDate, "week")) continue

    const existing = reviewsByEmployee.get(review.employeeId) ?? []
    existing.push(review)
    reviewsByEmployee.set(review.employeeId, existing)
  }

  const result: WeeklySlackReportResult = {
    periodLabel,
    anchorDate: toInputDateValue(anchorDate),
    sent: [],
    skipped: [],
    failed: [],
  }

  await postSlackMessage(
    `Weekly employee review reports for *${periodLabel}* are being uploaded...`
  )

  for (const user of users) {
    const employeeId = getEmployeeId(user)
    const weekReviews = reviewsByEmployee.get(employeeId) ?? []

    if (weekReviews.length === 0) {
      result.skipped.push({
        employeeId,
        name: user.name,
        email: user.email,
        reason: "No reviews for this week",
      })
      continue
    }

    const filename = buildEmployeeReportFilename(user.name, anchorDate, "week")

    try {
      const pdfBuffer = await buildEmployeeReportPdf({
        employee: formatEmployeeForReport(user),
        reviews: formatReviewsForReport(weekReviews),
        anchorDate,
        periodMode: "week",
      })

      await uploadPdfToSlack({
        filename,
        pdfBuffer,
        title: `${user.name} - Weekly Review Report`,
        initialComment: `Weekly review report for *${user.name}* (${weekReviews.length} review${weekReviews.length === 1 ? "" : "s"})`,
      })

      result.sent.push({
        employeeId,
        name: user.name,
        email: user.email,
        filename,
        reviewCount: weekReviews.length,
      })
    } catch (error) {
      result.failed.push({
        employeeId,
        name: user.name,
        email: user.email,
        error: error instanceof Error ? error.message : "Failed to send report",
      })
    }
  }

  const summary = [
    `Weekly review upload complete for *${periodLabel}*.`,
    `Sent: ${result.sent.length}`,
    `Skipped (no reviews): ${result.skipped.length}`,
    result.failed.length > 0 ? `Failed: ${result.failed.length}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  await postSlackMessage(summary)

  return result
}
