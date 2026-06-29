"use client"

import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type EmployeeSearchProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function EmployeeSearch({
  id,
  value,
  onChange,
  placeholder = "Search employee by name...",
  className,
}: EmployeeSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pr-9 pl-8"
        aria-label="Search employees by name"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X />
        </Button>
      )}
    </div>
  )
}

export function filterEmployeesByName<T extends { name: string }>(
  employees: T[],
  query: string
) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return employees
  return employees.filter((employee) =>
    employee.name.toLowerCase().includes(normalized)
  )
}
