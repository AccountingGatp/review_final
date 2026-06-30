import { Router, type Response } from "express"

import { authenticate, type AuthenticatedRequest } from "../middleware/auth.js"
import { Review } from "../models/Review.js"
import { User } from "../models/User.js"
import { toDbAuthorRole } from "../types/review.js"
import { toDbUserRole } from "../types/user.js"
import {
  buildEmployeeReportFilename,
  buildEmployeeReportPdf,
} from "../utils/employee-report-pdf.js"
import {
  isPeriodMode,
  isWithinPeriod,
  parseAnchorDate,
  toInputDateValue,
} from "../utils/date-utils.js"

const router = Router()

router.get(
  "/employees/:id/pdf",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const employeeId = String(req.params.id ?? "").trim()
      const anchorDateValue = String(req.query.anchorDate ?? "").trim()
      const periodModeValue = String(req.query.periodMode ?? "week").trim()

      if (!employeeId) {
        res.status(400).json({ message: "Employee id is required" })
        return
      }

      if (!isPeriodMode(periodModeValue)) {
        res.status(400).json({ message: "periodMode must be week or month" })
        return
      }

      const anchorDate =
        parseAnchorDate(anchorDateValue) ?? parseAnchorDate(toInputDateValue(new Date()))

      if (!anchorDate) {
        res.status(400).json({ message: "anchorDate must be in YYYY-MM-DD format" })
        return
      }

      const employee = await User.findById(employeeId)
      if (!employee) {
        res.status(404).json({ message: "Employee not found" })
        return
      }

      const reviews = await Review.find({ employeeId }).sort({ date: -1, createdAt: -1 })
      const filteredReviews = reviews
        .filter((review) => isWithinPeriod(review.date, anchorDate, periodModeValue))
        .map((review) => ({
          date: review.date,
          authorName: review.authorName ?? "Unknown",
          authorRole: review.authorRole
            ? toDbAuthorRole(String(review.authorRole))
            : "PEER",
          content: review.content,
          rating: review.rating ?? undefined,
        }))

      const pdfBuffer = await buildEmployeeReportPdf({
        employee: {
          name: employee.name,
          email: employee.email,
          team: employee.team,
          role: toDbUserRole(String(employee.role)),
          teamLeadName: employee.teamLead?.name ?? undefined,
        },
        reviews: filteredReviews,
        anchorDate,
        periodMode: periodModeValue,
      })

      const filename = buildEmployeeReportFilename(
        employee.name,
        anchorDate,
        periodModeValue
      )

      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
      res.setHeader("Content-Length", pdfBuffer.length)
      res.send(pdfBuffer)
    } catch (error) {
      console.error("Failed to generate employee report PDF:", error)
      res.status(500).json({ message: "Failed to generate report PDF" })
    }
  }
)

export default router
