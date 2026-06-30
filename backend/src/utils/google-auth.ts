import { OAuth2Client } from "google-auth-library"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

let googleClient: OAuth2Client | null = null

function getGoogleClient() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not configured")
  }

  if (!googleClient) {
    googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)
  }

  return googleClient
}

export function isGoogleAuthConfigured() {
  return Boolean(GOOGLE_CLIENT_ID)
}

export async function verifyGoogleIdToken(credential: string) {
  const client = getGoogleClient()
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()

  if (!payload?.email) {
    throw new Error("Google account email is missing")
  }

  if (payload.email_verified === false) {
    throw new Error("Google account email is not verified")
  }

  return {
    email: payload.email.toLowerCase(),
    name: payload.name ?? payload.email,
    googleId: payload.sub,
    picture: payload.picture,
  }
}
