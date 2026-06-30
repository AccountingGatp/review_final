import { WebClient } from "@slack/web-api"

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID

let slackClient: WebClient | null = null

export function isSlackConfigured() {
  return Boolean(SLACK_BOT_TOKEN && SLACK_CHANNEL_ID)
}

function getSlackClient() {
  if (!SLACK_BOT_TOKEN) {
    throw new Error("SLACK_BOT_TOKEN is not configured")
  }

  if (!slackClient) {
    slackClient = new WebClient(SLACK_BOT_TOKEN)
  }

  return slackClient
}

export function getSlackChannelId() {
  if (!SLACK_CHANNEL_ID) {
    throw new Error("SLACK_CHANNEL_ID is not configured")
  }

  return SLACK_CHANNEL_ID
}

type UploadPdfToSlackOptions = {
  filename: string
  pdfBuffer: Buffer
  title: string
  initialComment?: string
}

export async function uploadPdfToSlack({
  filename,
  pdfBuffer,
  title,
  initialComment,
}: UploadPdfToSlackOptions) {
  const client = getSlackClient()
  const channelId = getSlackChannelId()

  const response = await client.files.uploadV2({
    channel_id: channelId,
    filename,
    title,
    file: pdfBuffer,
    initial_comment: initialComment,
  })

  if (!response.ok) {
    throw new Error(response.error ?? "Failed to upload file to Slack")
  }

  return response
}

export async function postSlackMessage(text: string) {
  const client = getSlackClient()
  const channelId = getSlackChannelId()

  const response = await client.chat.postMessage({
    channel: channelId,
    text,
  })

  if (!response.ok) {
    throw new Error(response.error ?? "Failed to post Slack message")
  }

  return response
}
