import type { VercelRequest, VercelResponse } from '@vercel/node'

const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3-8b-instruct:free'
const SITE_URL = process.env.OPENROUTER_SITE_URL || 'https://panavest.ai'
const APP_NAME = process.env.OPENROUTER_APP_NAME || 'PanAvest AI'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured' })
    return
  }

  const { prompt } = req.body || {}
  if (!prompt) {
    res.status(400).json({ error: 'Missing prompt' })
    return
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': APP_NAME,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: String(prompt) }],
        temperature: 0.3,
        max_tokens: 260,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      res.status(response.status).send(errText)
      return
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content || ''
    res.status(200).json({ text })
  } catch (error) {
    res.status(500).json({ error: 'PanAvest AI request failed' })
  }
}
