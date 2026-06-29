"use client"

import Link from "next/link"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useState } from "react"

import { NoDataFound } from "@/components/no-data-found"
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog"
import { EditEmployeeButton } from "@/components/employees/edit-employee-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { useAuth } from "@/hooks/use-auth"
import { useEmployees } from "@/hooks/use-employees"
import { useReviews } from "@/hooks/use-reviews"
import { EMPLOYEE_ROLE_LABELS } from "@/lib/types"
import { canAddEmployee, canDeleteEmployee, canEditEmployee } from "@/lib/permissions"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function EmployeesView() {
  const { user } = useAuth()
  const { employees, deleteEmployee, isLoading, error } = useEmployees()
  const { refreshReviews } = useReviews()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const showAddEmployee = canAddEmployee(user)
  const showEditEmployee = canEditEmployee(user)
  const showDeleteEmployee = canDeleteEmployee(user)

  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Delete ${name}? All reviews about them and reviews they wrote will also be deleted.`
    )

    if (!confirmed) return

    setDeletingId(id)
    setDeleteError(null)

    try {
      await deleteEmployee(id)
      await refreshReviews()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete employee")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Button variant="ghost" size="icon-sm" render={<Link href="/" />}>
          <ArrowLeft />
        </Button>
        <div className="flex flex-1 items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">Employees</h1>
            <p className="text-sm text-muted-foreground">
              All team members in the review system.
            </p>
          </div>
          {showAddEmployee && <AddEmployeeDialog />}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        {deleteError && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {deleteError}
          </p>
        )}

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading employees...</p>
        ) : employees.length === 0 ? (
          <NoDataFound
            title="No employees found"
            description={
              showAddEmployee
                ? "Add your first team member to start collecting reviews."
                : "No employees have been added yet."
            }
          >
            {showAddEmployee && <AddEmployeeDialog />}
          </NoDataFound>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{employee.name}</CardTitle>
                        <CardDescription>
                          {EMPLOYEE_ROLE_LABELS[employee.role]}
                        </CardDescription>
                      </div>
                    </div>
                    {(showEditEmployee || showDeleteEmployee) && (
                      <div className="flex items-center gap-1">
                        {showEditEmployee && <EditEmployeeButton employee={employee} />}
                        {showDeleteEmployee && user?.id !== employee.id && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={deletingId === employee.id}
                            onClick={() => handleDelete(employee.id, employee.name)}
                            aria-label={`Delete ${employee.name}`}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{employee.team}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{employee.email}</p>
                  {employee.teamLead && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Team Lead: {employee.teamLead.name}
                    </p>
                  )}
                  {employee.createdBy && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Added by: {employee.createdBy.name} (
                      {EMPLOYEE_ROLE_LABELS[
                        employee.createdBy.role as keyof typeof EMPLOYEE_ROLE_LABELS
                      ] ?? employee.createdBy.role}
                      )
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
