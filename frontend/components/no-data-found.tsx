import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type NoDataFoundProps = {
  title?: string
  description?: string
  className?: string
  children?: ReactNode
}

export function NoDataFound({
  title = "No data found",
  description,
  className,
  children,
}: NoDataFoundProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <CardDescription className="mt-1 max-w-sm">{description}</CardDescription>
        )}
        {children && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  )
}
