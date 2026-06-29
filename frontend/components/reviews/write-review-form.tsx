"use client"

import { useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  EmployeeSearch,
  filterEmployeesByName,
} from "@/components/employees/employee-search"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { useEmployees } from "@/hooks/use-employees"
import { useReviews } from "@/hooks/use-reviews"
import { EMPLOYEE_ROLE_LABELS, type Employee } from "@/lib/types"
import { getReviewableEmployees } from "@/lib/permissions"
import { cn } from "@/lib/utils"
import { toInputDateValue } from "@/lib/date-utils"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function WriteReviewForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { employees } = useEmployees()
  const { addReview } = useReviews()

  const [employeeSearch, setEmployeeSearch] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [date, setDate] = useState(() => toInputDateValue(new Date()))
  const [content, setContent] = useState("")
  const [rating, setRating] = useState("5")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const filteredEmployees = useMemo(() => {
    const reviewable = getReviewableEmployees(employees, user)
    return filterEmployeesByName(reviewable, employeeSearch)
  }, [employees, employeeSearch, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedEmployee) {
      setSubmitError("Please select an employee")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await addReview({
        employeeId: selectedEmployee.id,
        date,
        content: content.trim(),
        rating: Number(rating),
      })

      router.push("/")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to add review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Add Review</CardTitle>
        <CardDescription>
          Write feedback about an employee for a specific date. The review will be
          saved under your logged-in account
          {user ? ` (${user.name})` : ""}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="employee-search">Employee</Label>
            <EmployeeSearch
              id="employee-search"
              value={employeeSearch}
              onChange={(value) => {
                setEmployeeSearch(value)
                setSelectedEmployee(null)
              }}
              placeholder="Search employee by name..."
            />

            {selectedEmployee ? (
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{selectedEmployee.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {EMPLOYEE_ROLE_LABELS[selectedEmployee.role]} · {selectedEmployee.team}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedEmployee(null)
                    setEmployeeSearch("")
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                {filteredEmployees.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">No employees found.</p>
                ) : (
                  filteredEmployees.map((employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(employee)
                        setEmployeeSearch(employee.name)
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-muted/60"
                      )}
                    >
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {getInitials(employee.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">{employee.team}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="review-date">Date</Label>
              <Input
                id="review-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="review-rating">Rating</Label>
              <Select
                value={rating}
                onValueChange={(value) => setRating(value ?? "5")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="review-rating" className="w-full">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <SelectItem key={value} value={String(value)} label={`${value}/5`}>
                      {value}/5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="review-content">Review</Label>
            <Textarea
              id="review-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write your feedback about this employee..."
              rows={5}
              required
              disabled={isSubmitting}
            />
          </div>

          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              render={<Link href="/" />}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Review"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
