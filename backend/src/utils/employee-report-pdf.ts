import PDFDocument from "pdfkit"

import type { AuthorRole } from "../types/review.js"
import type { UserRole } from "../types/user.js"
import { formatFullDate, formatPeriodLabel, type PeriodMode } from "./date-utils.js"

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 48
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const COLORS = {
  primary: "#1d4ed8",
  primaryDark: "#1e3a8a",
  accent: "#3b82f6",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  surface: "#f8fafc",
  white: "#ffffff",
  amber: "#d97706",
  teamLead: "#7c3aed",
  manager: "#2563eb",
  peer: "#059669",
}

const EMPLOYEE_ROLE_LABELS: Record<UserRole, string> = {
  TEAM_LEAD: "Team Lead",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
}

const AUTHOR_ROLE_LABELS: Record<AuthorRole, string> = {
  TEAM_LEAD: "Team Lead",
  MANAGER: "Manager",
  PEER: "Peer",
}

const AUTHOR_ROLE_COLORS: Record<AuthorRole, string> = {
  TEAM_LEAD: COLORS.teamLead,
  MANAGER: COLORS.manager,
  PEER: COLORS.peer,
}

const AUTHOR_ROLE_LIGHT_COLORS: Record<AuthorRole, string> = {
  TEAM_LEAD: "#ede9fe",
  MANAGER: "#dbeafe",
  PEER: "#d1fae5",
}

export type ReportEmployee = {
  name: string
  email: string
  team: string
  role: UserRole
  teamLeadName?: string
}

export type ReportReview = {
  date: string
  authorName: string
  authorRole: AuthorRole
  content: string
  rating?: number
}

type BuildEmployeeReportPdfOptions = {
  employee: ReportEmployee
  reviews: ReportReview[]
  anchorDate: Date
  periodMode: PeriodMode
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function getAverageRating(reviews: ReportReview[]) {
  const rated = reviews.filter((review) => review.rating !== undefined)
  if (rated.length === 0) return null
  const total = rated.reduce((sum, review) => sum + (review.rating ?? 0), 0)
  return (total / rated.length).toFixed(1)
}

function wrapText(doc: PDFKit.PDFDocument, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (doc.widthOfString(candidate) <= maxWidth) {
      current = candidate
      continue
    }

    if (current) lines.push(current)
    current = word
  }

  if (current) lines.push(current)
  return lines.length > 0 ? lines : [""]
}

function drawRatingBadge(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  rating?: number
) {
  const label = rating !== undefined ? `${rating} / 5` : "N/A"
  const badgeHeight = 22

  doc.roundedRect(x, y, width, badgeHeight, 11).fill("#fef3c7")
  doc
    .fillColor(COLORS.amber)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(label, x, y + 6, {
      width,
      align: "center",
      lineBreak: false,
    })
}

function drawPageFooter(doc: PDFKit.PDFDocument, pageNumber: number, totalPages: number) {
  const footerY = PAGE_HEIGHT - 36
  doc
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(MARGIN, footerY)
    .lineTo(PAGE_WIDTH - MARGIN, footerY)
    .stroke()

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(8)
    .text("GATP Solutions · Confidential Employee Review Report", MARGIN, footerY + 10, {
      width: CONTENT_WIDTH - 60,
      align: "left",
      lineBreak: false,
    })
    .text(`Page ${pageNumber} of ${totalPages}`, MARGIN, footerY + 10, {
      width: CONTENT_WIDTH,
      align: "right",
      lineBreak: false,
    })
}

function drawHeader(
  doc: PDFKit.PDFDocument,
  periodMode: PeriodMode,
  periodLabel: string
) {
  doc.save()
  doc.rect(0, 0, PAGE_WIDTH, 118).fill(COLORS.primary)

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("GATP SOLUTIONS", MARGIN, 34, { lineBreak: false })

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .text("Employee Review Report", MARGIN, 52, { lineBreak: false })

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#dbeafe")
    .text(
      `Generated ${new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`,
      MARGIN,
      84,
      { lineBreak: false }
    )

  const badgeText = `${periodMode === "week" ? "Week" : "Month"}: ${periodLabel}`
  doc.font("Helvetica-Bold").fontSize(10)
  const badgeWidth = doc.widthOfString(badgeText) + 24
  const badgeX = PAGE_WIDTH - MARGIN - badgeWidth
  const badgeY = 42

  doc.roundedRect(badgeX, badgeY, badgeWidth, 28, 14).fill(COLORS.white)
  doc
    .fillColor(COLORS.primaryDark)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(badgeText, badgeX, badgeY + 9, { width: badgeWidth, align: "center", lineBreak: false })

  doc.restore()
}

function drawStatBox(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string
) {
  doc.roundedRect(x, y, width, 72, 10).fillAndStroke(COLORS.surface, COLORS.border)

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(9)
    .text(label.toUpperCase(), x + 14, y + 16, { width: width - 28, lineBreak: false })

  doc
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text(value, x + 14, y + 34, { width: width - 28, lineBreak: false })
}

function drawEmployeeSection(doc: PDFKit.PDFDocument, y: number, employee: ReportEmployee) {
  const boxHeight = employee.teamLeadName ? 118 : 102

  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, boxHeight, 12).fillAndStroke(COLORS.white, COLORS.border)

  doc
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(employee.name, MARGIN + 18, y + 18, { lineBreak: false })

  doc
    .fillColor(COLORS.primary)
    .roundedRect(MARGIN + 18, y + 42, 88, 22, 11)
    .fill()

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(EMPLOYEE_ROLE_LABELS[employee.role], MARGIN + 18, y + 49, {
      width: 88,
      align: "center",
      lineBreak: false,
    })

  const details = [
    `Team: ${employee.team}`,
    `Email: ${employee.email}`,
    employee.teamLeadName ? `Team Lead: ${employee.teamLeadName}` : null,
  ].filter(Boolean) as string[]

  let detailY = y + 72
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10)

  for (const detail of details) {
    doc.text(detail, MARGIN + 18, detailY, { width: CONTENT_WIDTH - 36, lineBreak: false })
    detailY += 14
  }

  return y + boxHeight + 22
}

function measureReviewCardHeight(doc: PDFKit.PDFDocument, review: ReportReview) {
  const textWidth = CONTENT_WIDTH - 36
  doc.font("Helvetica").fontSize(10)
  const lines = wrapText(doc, review.content, textWidth)
  const contentHeight = lines.length * 13 + Math.max(0, lines.length - 1) * 3
  return 96 + contentHeight
}

function drawReviewCard(doc: PDFKit.PDFDocument, y: number, review: ReportReview) {
  const accent = AUTHOR_ROLE_COLORS[review.authorRole]
  const textWidth = CONTENT_WIDTH - 36
  const cardHeight = measureReviewCardHeight(doc, review)
  const ratingBadgeWidth = 56
  const ratingBadgeX = PAGE_WIDTH - MARGIN - ratingBadgeWidth - 12

  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, cardHeight, 10).fillAndStroke(COLORS.white, COLORS.border)
  doc.rect(MARGIN, y, 5, cardHeight).fill(accent)

  doc
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(formatFullDate(review.date), MARGIN + 18, y + 16, {
      width: ratingBadgeX - MARGIN - 30,
      lineBreak: false,
    })

  drawRatingBadge(doc, ratingBadgeX, y + 12, ratingBadgeWidth, review.rating)

  doc
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(review.authorName, MARGIN + 18, y + 38, { lineBreak: false })

  const roleLabel = AUTHOR_ROLE_LABELS[review.authorRole]
  doc.font("Helvetica-Bold").fontSize(8)
  const roleWidth = doc.widthOfString(roleLabel) + 16
  doc.roundedRect(MARGIN + 18, y + 54, roleWidth, 18, 9).fill(AUTHOR_ROLE_LIGHT_COLORS[review.authorRole])
  doc
    .fillColor(accent)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(roleLabel, MARGIN + 18, y + 60, { width: roleWidth, align: "center", lineBreak: false })

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("FEEDBACK", MARGIN + 18, y + 82, { lineBreak: false })

  doc.fillColor(COLORS.text).font("Helvetica").fontSize(10)
  const feedbackLines = wrapText(doc, review.content, textWidth)
  let feedbackY = y + 96
  for (const line of feedbackLines) {
    doc.text(line, MARGIN + 18, feedbackY, { lineBreak: false })
    feedbackY += 13
  }

  return y + cardHeight + 14
}

export function buildEmployeeReportFilename(
  employeeName: string,
  anchorDate: Date,
  periodMode: PeriodMode
) {
  const periodLabel = formatPeriodLabel(anchorDate, periodMode)
  return `review-report-${slugify(employeeName)}-${slugify(periodLabel)}.pdf`
}

export function buildEmployeeReportPdf({
  employee,
  reviews,
  anchorDate,
  periodMode,
}: BuildEmployeeReportPdfOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      autoFirstPage: true,
    })

    const chunks: Buffer[] = []
    doc.on("data", (chunk: Buffer) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    const periodLabel = formatPeriodLabel(anchorDate, periodMode)
    const sortedReviews = [...reviews].sort((a, b) => b.date.localeCompare(a.date))
    const avgRating = getAverageRating(sortedReviews)
    const reviewerCount = new Set(sortedReviews.map((review) => review.authorName)).size

    drawHeader(doc, periodMode, periodLabel)

    let y = 136
    const statWidth = (CONTENT_WIDTH - 24) / 3
    const footerReserve = 56

    drawStatBox(doc, MARGIN, y, statWidth, "Total Reviews", String(sortedReviews.length))
    drawStatBox(
      doc,
      MARGIN + statWidth + 12,
      y,
      statWidth,
      "Average Rating",
      avgRating ? `${avgRating} / 5` : "N/A"
    )
    drawStatBox(
      doc,
      MARGIN + (statWidth + 12) * 2,
      y,
      statWidth,
      "Reviewers",
      String(reviewerCount)
    )

    y += 96
    y = drawEmployeeSection(doc, y, employee)

    doc
      .fillColor(COLORS.text)
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Review Details", MARGIN, y, { lineBreak: false })

    y += 24

    if (sortedReviews.length === 0) {
      doc
        .roundedRect(MARGIN, y, CONTENT_WIDTH, 64, 10)
        .fillAndStroke(COLORS.surface, COLORS.border)

      doc
        .fillColor(COLORS.muted)
        .font("Helvetica")
        .fontSize(11)
        .text(
          "No reviews were recorded for this employee during the selected period.",
          MARGIN + 18,
          y + 24,
          { width: CONTENT_WIDTH - 36, align: "center", lineBreak: false }
        )
    } else {
      for (const review of sortedReviews) {
        const neededHeight = measureReviewCardHeight(doc, review) + 14
        if (y + neededHeight > PAGE_HEIGHT - footerReserve) {
          doc.addPage()
          y = MARGIN
        }
        y = drawReviewCard(doc, y, review)
      }
    }

    const pageRange = doc.bufferedPageRange()
    const totalPages = pageRange.count
    for (let index = 0; index < totalPages; index += 1) {
      doc.switchToPage(index)
      drawPageFooter(doc, index + 1, totalPages)
    }

    doc.end()
  })
}
