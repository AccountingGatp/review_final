import mongoose, { Schema, type InferSchemaType } from "mongoose"

import { USER_ROLES } from "../types/user.js"

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    team: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLES,
    },
    createdBy: {
      userId: { type: String },
      name: { type: String },
      email: { type: String },
      role: { type: String },
    },
    teamLead: {
      userId: { type: String },
      name: { type: String },
      email: { type: String },
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
)

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId
}

export const User = mongoose.model("User", userSchema)
