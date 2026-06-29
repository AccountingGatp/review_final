"use client"

import { useState, type FormEvent } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useAuth } from "@/hooks/use-auth"
import { useEmployees } from "@/hooks/use-employees"
import {
  EMPLOYEE_ROLE_LABELS,
  EMPLOYEE_ROLE_OPTIONS,
  type EmployeeRole,
} from "@/lib/types"
import { canAddEmployee } from "@/lib/permissions"

const emptyForm = {
  name: "",
  role: "EMPLOYEE" as EmployeeRole,
  team: "",
  email: "",
}

type AddEmployeeDialogProps = {
  onAdded?: (employeeId: string) => void
}

export function AddEmployeeDialog({ onAdded }: AddEmployeeDialogProps) {
  const { user } = useAuth()
  const { addEmployee } = useEmployees()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (!canAddEmployee(user)) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = form.name.trim()
    const team = form.team.trim()
    const email = form.email.trim()

    if (!name || !team || !email) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const employee = await addEmployee({
        name,
        role: form.role,
        team,
        email,
      })
      setForm(emptyForm)
      setOpen(false)
      onAdded?.(employee.id)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to add employee")
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateField<K extends keyof typeof emptyForm>(
    field: K,
    value: (typeof emptyForm)[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setSubmitError(null)
        }
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus />
        Add Employee
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Managers can add employees. Your details are saved as the creator in the
            database.
          </DialogDescription>
        </DialogHeader>

        <form id="add-employee-form" onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="employee-name">Full name</Label>
            <Input
              id="employee-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Jane Doe"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="employee-role">Role</Label>
            <Select
              value={form.role}
              onValueChange={(value) => updateField("role", value as EmployeeRole)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="employee-role" className="w-full">
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
            <Label htmlFor="employee-team">Team</Label>
            <Input
              id="employee-team"
              value={form.team}
              onChange={(event) => updateField("team", event.target.value)}
              placeholder="Product Engineering"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="employee-email">Email</Label>
            <Input
              id="employee-email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="jane.doe@company.com"
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
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="add-employee-form" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
