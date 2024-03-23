import { NextRequest } from 'next/server'
import OpenAI from 'openai'

import { EnvKey, GetEnv } from '../utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<Response> {
  const { messages } = await request.json()

  const openai = new OpenAI({
    apiKey: GetEnv(EnvKey.openAiApiKey),
  })

  if (!messages) {
    return new Response('No messages provided', { status: 400 })
  }

  const completion = await openai.chat.completions.create({
    messages,
    model: 'gpt-3.5-turbo',
    max_tokens: 70,
  })

  if (!completion || !completion.choices || !completion.choices[0]) {
    return new Response('No completion found', { status: 500 })
  }

  return Response.json({ data: completion.choices[0].message.content })
}
