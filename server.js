import http from 'node:http'
import { z } from 'zod'

const askSchema = z
  .object({
    message: z
      .string({
        required_error: 'message is required',
        invalid_type_error: 'message must be a string',
      })
      .trim()
      .min(1, 'message cannot be empty'),
    sessionId: z
      .string({
        required_error: 'sessionId is required',
        invalid_type_error: 'sessionId must be a string',
      })
      .trim()
      .min(1, 'sessionId cannot be empty'),
  })
  .strict()

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''

    req.on('data', (chunk) => {
      data += chunk
    })

    req.on('end', () => {
      if (!data.trim()) {
        req.body = {}
        resolve({})
        return
      }

      try {
        const parsed = JSON.parse(data)
        req.body = parsed
        resolve(parsed)
      } catch (error) {
        reject(error)
      }
    })

    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'POST' && req.url === '/ask') {
    try {
      const body = await parseJsonBody(req)
      const validation = askSchema.safeParse(body)

      if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors
        res.statusCode = 400
        res.end(JSON.stringify({ message: 'Invalid request body', errors }))
        return
      }

      const { message, sessionId } = validation.data

      res.statusCode = 200
      res.end(
        JSON.stringify({
          reply: `Mensagem recebida para processamento seguro.`,
          sessionId,
          received: { message },
        })
      )
      return
    } catch (error) {
      console.error('[ASK] Failed to process request', error)

      if (error instanceof SyntaxError) {
        res.statusCode = 400
        res.end(JSON.stringify({ message: 'Invalid JSON payload' }))
        return
      }

      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Internal server error' }))
      return
    }
  }

  res.statusCode = 404
  res.end(JSON.stringify({ message: 'Not Found' }))
})

const port = process.env.PORT || 4000

server.listen(port, () => {
  console.log(`[ASK] Bot service listening on port ${port}`)
})

export default server
