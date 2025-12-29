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

const parseJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let data = ''

    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      if (!data.trim()) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(data))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })

export const registerAskRoutes = (router) => {
  router.post('/ask', [], async ({ req, res }) => {
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
          reply: 'Mensagem recebida para processamento seguro.',
          sessionId,
          received: { message },
        })
      )
    } catch (error) {
      if (error instanceof SyntaxError) {
        res.statusCode = 400
        res.end(JSON.stringify({ message: 'Invalid JSON payload' }))
        return
      }

      console.error('[ASK] Failed to process request', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Internal server error' }))
    }
  })
}
