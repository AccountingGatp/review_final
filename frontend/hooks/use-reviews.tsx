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

import { createReview, fetchReviews, type NewReviewPayload } from "@/lib/api"
import type { ReviewNote } from "@/lib/types"

type ReviewsContextValue = {
  reviews: ReviewNote[]
  isLoading: boolean
  error: string | null
  addReview: (review: NewReviewPayload) => Promise<ReviewNote>
  refreshReviews: () => Promise<void>
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null)

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<ReviewNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchReviews()
      setReviews(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews")
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshReviews()
  }, [refreshReviews])

  const addReview = useCallback(async (review: NewReviewPayload) => {
    const created = await createReview(review)
    setReviews((current) => [created, ...current])
    return created
  }, [])

  const value = useMemo(
    () => ({
      reviews,
      isLoading,
      error,
      addReview,
      refreshReviews,
    }),
    [reviews, isLoading, error, addReview, refreshReviews]
  )

  return (
    <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewsContext)
  if (!context) {
    throw new Error("useReviews must be used within ReviewsProvider")
  }
  return context
}
