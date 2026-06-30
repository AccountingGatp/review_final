import jwt, { type SignOptions } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production"
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"]

export type JwtPayload = {
  userId: string
  email: string
  name: string
  role: string
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}
