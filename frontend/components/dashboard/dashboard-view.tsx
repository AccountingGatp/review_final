"use client"

import { useEffect, useMemo, useState } from "react"

import { NoDataFound } from "@/components/no-data-found"
import { EmployeeDetail } from "@/components/dashboard/employee-detail"
import {
  DashboardStats,
  EmployeeList,
} from "@/components/dashboard/employee-list"
import { PeriodFilter } from "@/components/dashboard/period-filter"
import {
  EmployeeSearch,
  filterEmployeesByName,
} from "@/components/employees/employee-search"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useEmployees } from "@/hooks/use-employees"
import { useReviews } from "@/hooks/use-reviews"
import { isWithinPeriod, type PeriodMode } from "@/lib/date-utils"

export function DashboardView() {
  const { employees, isLoading: employeesLoading, error: employeesError } = useEmployees()
  const { reviews, isLoading: reviewsLoading, error: reviewsError } = useReviews()
  const [periodMode, setPeriodMode] = useState<PeriodMode>("week")
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id ?? "")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEmployees = useMemo(
    () => filterEmployeesByName(employees, searchQuery),
    [employees, searchQuery]
  )

  useEffect(() => {
    if (filteredEmployees.length === 0) {
      setSelectedEmployeeId("")
      return
    }
    if (!filteredEmployees.some((employee) => employee.id === selectedEmployeeId)) {
      setSelectedEmployeeId(filteredEmployees[0].id)
    }
  }, [filteredEmployees, selectedEmployeeId])

  const filteredReviews = useMemo(
    () => reviews.filter((note) => isWithinPeriod(note.date, anchorDate, periodMode)),
    [reviews, anchorDate, periodMode]
  )

  const reviewCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const note of filteredReviews) {
      counts[note.employeeId] = (counts[note.employeeId] ?? 0) + 1
    }
    return counts
  }, [filteredReviews])

  const selectedEmployee =
    filteredEmployees.find((e) => e.id === selectedEmployeeId) ?? filteredEmployees[0]

  const selectedReviews = useMemo(
    () =>
      selectedEmployee
        ? filteredReviews.filter((note) => note.employeeId === selectedEmployee.id)
        : [],
    [filteredReviews, selectedEmployee]
  )

  const employeesWithReviews = Object.keys(reviewCounts).length
  const uniqueAuthors = new Set(
    filteredReviews.map((note) => note.reviewBy ?? note.authorName)
  ).size

  const isLoading = employeesLoading || reviewsLoading
  const loadError = employeesError ?? reviewsError

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex flex-1 flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:py-0">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Employee feedback from team leads, managers, and peers.
            </p>
          </div>
          <PeriodFilter
            mode={periodMode}
            anchor={anchorDate}
            onModeChange={setPeriodMode}
            onAnchorChange={setAnchorDate}
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-hidden p-4 md:p-6">
        {loadError && (
          <p className="text-sm text-destructive" role="alert">
            {loadError}
          </p>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        ) : employees.length === 0 ? (
          <NoDataFound
            title="No employees found"
            description="Add employees to start viewing reviews on the dashboard."
          />
        ) : (
          <>
            <DashboardStats
              totalReviews={filteredReviews.length}
              employeesWithReviews={employeesWithReviews}
              totalEmployees={employees.length}
              uniqueAuthors={uniqueAuthors}
            />

            <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[280px_1fr]">
              <Card className="overflow-hidden py-3">
                <CardContent className="flex h-full flex-col gap-3 px-3">
                  <EmployeeSearch value={searchQuery} onChange={setSearchQuery} />
                  <EmployeeList
                    employees={filteredEmployees}
                    reviewCounts={reviewCounts}
                    selectedId={selectedEmployee?.id ?? ""}
                    onSelect={setSelectedEmployeeId}
                  />
                </CardContent>
              </Card>

              <Card className="min-h-[420px] overflow-hidden lg:min-h-0">
                <CardContent className="h-full pt-4">
                  {selectedEmployee ? (
                    <EmployeeDetail employee={selectedEmployee} reviews={selectedReviews} />
                  ) : (
                    <NoDataFound
                      title="No employees found"
                      description={
                        searchQuery
                          ? "No employees match your search."
                          : "No employees to display."
                      }
                      className="h-full"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  )
}
