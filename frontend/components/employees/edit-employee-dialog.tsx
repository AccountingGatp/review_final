"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEmployees } from "@/hooks/use-employees"
import {
  EMPLOYEE_ROLE_LABELS,
  EMPLOYEE_ROLE_OPTIONS,
  type Employee,
  type EmployeeRole,
} from "@/lib/types"

type EditEmployeeDialogProps = {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditEmployeeDialog({
  employee,
  open,
  onOpenChange,
}: EditEmployeeDialogProps) {
  const { updateEmployee } = useEmployees()
  const [form, setForm] = useState({
    name: employee.name,
    role: employee.role,
    team: employee.team,
    email: employee.email,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm({
        name: employee.name,
        role: employee.role,
        team: employee.team,
        email: employee.email,
      })
      setSubmitError(null)
    }
  }, [open, employee])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = form.name.trim()
    const team = form.team.trim()
    const email = form.email.trim()

    if (!name || !team || !email) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await updateEmployee(employee.id, {
        name,
        role: form.role,
        team,
        email,
      })
      onOpenChange(false)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to update employee")
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update employee details. Only managers can edit employees.
          </DialogDescription>
        </DialogHeader>

        <form id={`edit-employee-form-${employee.id}`} onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`edit-employee-name-${employee.id}`}>Full name</Label>
            <Input
              id={`edit-employee-name-${employee.id}`}
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`edit-employee-role-${employee.id}`}>Role</Label>
            <Select
              value={form.role}
              onValueChange={(value) => updateField("role", value as EmployeeRole)}
              disabled={isSubmitting}
            >
              <SelectTrigger id={`edit-employee-role-${employee.id}`} className="w-full">
                <SelectValue placeholder="Select role">
                  {EMPLOYEE_ROLE_LABELS[form.role]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_ROLE_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value} label={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`edit-employee-team-${employee.id}`}>Team</Label>
            <Input
              id={`edit-employee-team-${employee.id}`}
              value={form.team}
              onChange={(event) => updateField("team", event.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`edit-employee-email-${employee.id}`}>Email</Label>
            <Input
              id={`edit-employee-email-${employee.id}`}
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={`edit-employee-form-${employee.id}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type EditEmployeeButtonProps = {
  employee: Employee
}

export function EditEmployeeButton({ employee }: EditEmployeeButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${employee.name}`}
      >
        <Pencil />
      </Button>
      <EditEmployeeDialog employee={employee} open={open} onOpenChange={setOpen} />
    </>
  )
}
