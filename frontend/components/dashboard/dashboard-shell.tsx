"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { EmployeesProvider } from "@/hooks/use-employees"
import { ReviewsProvider } from "@/hooks/use-reviews"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <EmployeesProvider>
        <ReviewsProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </ReviewsProvider>
      </EmployeesProvider>
    </AuthGuard>
  )
}
