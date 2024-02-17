import { NextRequest } from 'next/server'
import OpenAI from 'openai'

import { EnvKey, GetEnv } from '../utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl
  const content = searchParams.get('content')

  const openai = new OpenAI({
    apiKey: GetEnv(EnvKey.openAiApiKey),
  })

  if (!content) {
    return new Response('No content provided', { status: 400 })
  }

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: content,
      },
    ],
    model: 'gpt-3.5-turbo',
  })

  if (!completion || !completion.choices || !completion.choices[0]) {
    return new Response('No completion found', { status: 500 })
  }

  return Response.json({ data: completion.choices[0].message.content })
}
