import mongoose, { Schema, type InferSchemaType } from "mongoose"

import { AUTHOR_ROLES } from "../types/review.js"

const reviewSchema = new Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    reviewBy: {
      type: String,
      trim: true,
    },
    authorName: {
      type: String,
      trim: true,
    },
    authorRole: {
      type: String,
      enum: AUTHOR_ROLES,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
    collection: "reviews",
  }
)

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & {
  _id: mongoose.Types.ObjectId
}

export const Review = mongoose.model("Review", reviewSchema)
