import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { EmployeesView } from "@/components/employees/employees-view"

export default function EmployeesPage() {
  return (
    <DashboardShell>
      <EmployeesView />
    </DashboardShell>
  )
}
