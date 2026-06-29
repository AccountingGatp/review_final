import Link from "next/link"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
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

export default function SettingsPage() {
  return (
    <DashboardShell>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-md border-dashed">
          <CardHeader className="text-center">
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Account and notification preferences will be configured here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button render={<Link href="/" />}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </main>
    </DashboardShell>
  )
}
