import { Router, type Request, type Response } from "express"

import { sendWeeklyReportsToSlack } from "../services/weekly-slack-reports.service.js"
import { parseAnchorDate, toInputDateValue } from "../utils/date-utils.js"

const router = Router()

router.get("/weekly-reports", async (req: Request, res: Response) => {
  try {
    const anchorDateValue = String(req.query.anchorDate ?? "").trim()

    if (anchorDateValue && !parseAnchorDate(anchorDateValue)) {
      res.status(400).json({ message: "anchorDate must be in YYYY-MM-DD format" })
      return
    }

    const result = await sendWeeklyReportsToSlack(
      anchorDateValue || toInputDateValue(new Date())
    )

    res.json({
      message: "Weekly reports processed for Slack",
      ...result,
    })
  } catch (error) {
    console.error("Failed to send weekly reports to Slack:", error)
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to send weekly reports to Slack",
    })
  }
})

export default router
