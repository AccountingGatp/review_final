"use client"

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  formatPeriodLabel,
  shiftPeriod,
  toInputDateValue,
  type PeriodMode,
} from "@/lib/date-utils"

type PeriodFilterProps = {
  mode: PeriodMode
  anchor: Date
  onModeChange: (mode: PeriodMode) => void
  onAnchorChange: (date: Date) => void
}

export function PeriodFilter({
  mode,
  anchor,
  onModeChange,
  onAnchorChange,
}: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tabs
        value={mode}
        onValueChange={(value) => onModeChange(value as PeriodMode)}
      >
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-1 py-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onAnchorChange(shiftPeriod(anchor, mode, -1))}
          aria-label={`Previous ${mode}`}
        >
          <ChevronLeft />
        </Button>

        <div className="flex min-w-[200px] items-center justify-center gap-2 px-2 text-sm font-medium">
          <CalendarDays className="size-4 text-muted-foreground" />
          <span>{formatPeriodLabel(anchor, mode)}</span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onAnchorChange(shiftPeriod(anchor, mode, 1))}
          aria-label={`Next ${mode}`}
        >
          <ChevronRight />
        </Button>
      </div>

      <Input
        type="date"
        value={toInputDateValue(anchor)}
        onChange={(event) =>
          onAnchorChange(new Date(event.target.value + "T12:00:00"))
        }
        className="w-auto"
        aria-label="Jump to date"
      />
    </div>
  )
}
