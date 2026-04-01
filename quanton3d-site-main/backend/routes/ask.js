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

const registerSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  phone: z.string().trim().min(8, 'phone is required'),
  email: z.string().trim().email('email must be valid'),
  resin: z.string().trim().min(1, 'resin is required'),
  problemType: z.string().trim().min(1, 'problemType is required'),
  sessionId: z.string().trim().min(1, 'sessionId is required'),
})

const suggestionSchema = z.object({
  suggestion: z.string().trim().min(1, 'suggestion is required'),
  userName: z.string().trim().optional(),
  userPhone: z.string().trim().optional(),
  sessionId: z.string().trim().optional(),
  lastUserMessage: z.string().trim().optional(),
  lastBotReply: z.string().trim().optional(),
})

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

const parseMultipartForm = (req) =>
  new Promise((resolve, reject) => {
    const chunks = []

    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks)
        const raw = buffer.toString('utf8')

        const extractField = (field) => {
          const match = raw.match(new RegExp(`name="${field}"\\r\\n[\\s\\S]*?\\r\\n\\r\\n([\\s\\S]*?)\\r\\n`, 'i'))
          return match ? match[1].trim() : undefined
        }

        resolve({
          sessionId: extractField('sessionId'),
          message: extractField('message'),
        })
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

  router.post('/ask-with-image', [], async ({ req, res }) => {
    try {
      const body = await parseMultipartForm(req)

      res.statusCode = 200
      res.end(
        JSON.stringify({
          reply: 'Imagem recebida para processamento seguro.',
          sessionId: body.sessionId || 'session-image',
          received: { message: body.message || 'Imagem enviada', hasImage: true },
        })
      )
    } catch (error) {
      console.error('[ASK-WITH-IMAGE] Failed to process request', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Internal server error' }))
    }
  })

  router.post('/register-user', [], async ({ req, res }) => {
    try {
      const body = await parseJsonBody(req)
      const validation = registerSchema.safeParse(body)

      if (!validation.success) {
        const message = validation.error.errors.map((err) => err.message).join('; ')
        res.statusCode = 400
        res.end(JSON.stringify({ message: 'Invalid request body', errors: { details: message } }))
        return
      }

      res.statusCode = 201
      res.end(
        JSON.stringify({
          message: 'Usuário registrado com sucesso.',
          user: validation.data,
        })
      )
    } catch (error) {
      console.error('[REGISTER-USER] Failed to register user', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Internal server error' }))
    }
  })

  router.post('/suggest-knowledge', [], async ({ req, res }) => {
    try {
      const body = await parseJsonBody(req)
      const validation = suggestionSchema.safeParse(body)

      if (!validation.success) {
        const message = validation.error.errors.map((err) => err.message).join('; ')
        res.statusCode = 400
        res.end(JSON.stringify({ message: 'Invalid request body', errors: { details: message } }))
        return
      }

      res.statusCode = 200
      res.end(
        JSON.stringify({
          message: 'Sugestão recebida. Obrigado por colaborar com o conhecimento do bot.',
          suggestion: validation.data,
        })
      )
    } catch (error) {
      console.error('[SUGGEST-KNOWLEDGE] Failed to process suggestion', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Internal server error' }))
    }
  })
}
