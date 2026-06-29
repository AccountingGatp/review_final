"use client"

import { NoDataFound } from "@/components/no-data-found"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import type { Employee, ReviewNote } from "@/lib/types"
import { EMPLOYEE_ROLE_LABELS } from "@/lib/types"
import { cn } from "@/lib/utils"

type EmployeeListProps = {
  employees: Employee[]
  reviewCounts: Record<string, number>
  selectedId: string
  onSelect: (id: string) => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function EmployeeList({
  employees,
  reviewCounts,
  selectedId,
  onSelect,
}: EmployeeListProps) {
  return (
    <ScrollArea className="h-full min-h-[420px] pr-3">
      <div className="flex flex-col gap-1">
        <p className="mb-2 px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Team members
        </p>
        {employees.length === 0 ? (
          <NoDataFound
            title="No employees found"
            description="No team members match the current filters."
            className="border-0 shadow-none"
          />
        ) : (
          employees.map((employee) => {
          const count = reviewCounts[employee.id] ?? 0
          const isSelected = employee.id === selectedId

          return (
            <Button
              key={employee.id}
              variant="ghost"
              onClick={() => onSelect(employee.id)}
              className={cn(
                "h-auto w-full justify-start gap-3 rounded-xl px-3 py-3",
                isSelected && "bg-primary/10 ring-1 ring-primary/20 hover:bg-primary/10"
              )}
            >
              <Avatar size="lg">
                <AvatarFallback
                  className={cn(
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">{employee.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {EMPLOYEE_ROLE_LABELS[employee.role]}
                </p>
              </div>
              <Badge variant={count > 0 ? "default" : "secondary"}>{count}</Badge>
            </Button>
          )
        })
        )}
      </div>
    </ScrollArea>
  )
}

export function DashboardStats({
  totalReviews,
  employeesWithReviews,
  totalEmployees,
  uniqueAuthors,
}: {
  totalReviews: number
  employeesWithReviews: number
  totalEmployees: number
  uniqueAuthors: number
}) {
  const stats = [
    { label: "Reviews in period", value: totalReviews },
    {
      label: "Employees reviewed",
      value: `${employeesWithReviews}/${totalEmployees}`,
    },
    { label: "Contributors", value: uniqueAuthors },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {stat.value}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

export type GroupedReviews = {
  date: string
  notes: ReviewNote[]
}

export function groupReviewsByDate(notes: ReviewNote[]): GroupedReviews[] {
  const grouped = new Map<string, ReviewNote[]>()

  for (const note of notes) {
    const existing = grouped.get(note.date) ?? []
    existing.push(note)
    grouped.set(note.date, existing)
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, dateNotes]) => ({ date, notes: dateNotes }))
}
