"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { useAuth } from "@/hooks/use-auth"
import {
  createEmployee,
  deleteEmployee,
  fetchEmployees,
  updateEmployee,
  type NewEmployeePayload,
  type UpdateEmployeePayload,
} from "@/lib/api"
import { getVisibleEmployees } from "@/lib/permissions"
import type { Employee } from "@/lib/types"

type NewEmployee = NewEmployeePayload

type EmployeesContextValue = {
  employees: Employee[]
  isLoading: boolean
  error: string | null
  addEmployee: (employee: NewEmployee) => Promise<Employee>
  updateEmployee: (id: string, employee: UpdateEmployeePayload) => Promise<Employee>
  deleteEmployee: (id: string) => Promise<void>
  refreshEmployees: () => Promise<void>
}

const EmployeesContext = createContext<EmployeesContextValue | null>(null)

export function EmployeesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const employees = useMemo(
    () => getVisibleEmployees(allEmployees, user),
    [allEmployees, user]
  )

  const refreshEmployees = useCallback(async () => {
    if (!user?.id) {
      setAllEmployees([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchEmployees()
      setAllEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees")
      setAllEmployees([])
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void refreshEmployees()
  }, [refreshEmployees])

  const addEmployee = useCallback(async (employee: NewEmployee) => {
    const created = await createEmployee(employee)
    setAllEmployees((current) => [created, ...current])
    return created
  }, [])

  const editEmployee = useCallback(
    async (id: string, employee: UpdateEmployeePayload) => {
      const updated = await updateEmployee(id, employee)
      setAllEmployees((current) =>
        current.map((item) => (item.id === id ? updated : item))
      )
      return updated
    },
    []
  )

  const removeEmployee = useCallback(async (id: string) => {
    await deleteEmployee(id)
    setAllEmployees((current) => current.filter((employee) => employee.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      employees,
      isLoading,
      error,
      addEmployee,
      updateEmployee: editEmployee,
      deleteEmployee: removeEmployee,
      refreshEmployees,
    }),
    [employees, isLoading, error, addEmployee, editEmployee, removeEmployee, refreshEmployees]
  )

  return (
    <EmployeesContext.Provider value={value}>{children}</EmployeesContext.Provider>
  )
}

export function useEmployees() {
  const context = useContext(EmployeesContext)
  if (!context) {
    throw new Error("useEmployees must be used within EmployeesProvider")
  }
  return context
}
