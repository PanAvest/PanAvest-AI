import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.OPENROUTER_API_KEY
  const model = env.OPENROUTER_MODEL || 'meta-llama/llama-3-8b-instruct:free'
  const siteUrl = env.OPENROUTER_SITE_URL || 'http://localhost:5173'
  const title = env.OPENROUTER_APP_NAME || 'PanAvest AI'

  return {
    plugins: [react()],
    server: {
      configureServer(server) {
        server.middlewares.use('/api/ai', (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          if (!apiKey) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing OPENROUTER_API_KEY' }))
            return
          }

          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })

          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}')
              const prompt = String(parsed.prompt || '')

              if (!prompt) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Missing prompt' }))
                return
              }

              const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey}`,
                  'HTTP-Referer': siteUrl,
                  'X-Title': title,
                },
                body: JSON.stringify({
                  model,
                  messages: [{ role: 'user', content: prompt }],
                  temperature: 0.3,
                  max_tokens: 260,
                }),
              })

              if (!response.ok) {
                const errText = await response.text()
                res.statusCode = response.status
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: errText || 'PanAvest AI error' }))
                return
              }

              const data = await response.json()
              const text = data?.choices?.[0]?.message?.content

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ text: text || '' }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'PanAvest AI request failed' }))
            }
          })
        })
      },
    },
  }
})
