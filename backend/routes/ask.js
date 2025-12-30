import { z } from 'zod'
import { saveSuggestion } from '../services/suggestions.js'
import { saveUser } from '../services/users.js'

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

const suggestionSchema = z
  .object({
    suggestion: z.string().min(1, 'suggestion is required'),
    userName: z.string().optional(),
    userPhone: z.string().optional(),
    sessionId: z.string().optional(),
    lastUserMessage: z.string().optional(),
    lastBotReply: z.string().optional(),
  })
  .strict()

const registerUserSchema = z
  .object({
    name: z.string().min(1),
    phone: z.string().min(6),
    email: z.string().email(),
    resin: z.string().min(1),
    problemType: z.string().min(1),
    sessionId: z.string().min(1),
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

const readStream = (req) =>
  new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })

export const registerAskRoutes = (router) => {
  router.options('/api/ask', [], async ({ res }) => {
    res.statusCode = 204
    res.end()
  })

  router.options('/api/ask-with-image', [], async ({ res }) => {
    res.statusCode = 204
    res.end()
  })

  router.options('/api/register-user', [], async ({ res }) => {
    res.statusCode = 204
    res.end()
  })

  router.options('/api/suggest-knowledge', [], async ({ res }) => {
    res.statusCode = 204
    res.end()
  })

  router.post('/api/ask', [], async ({ req, res }) => {
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

  router.post('/api/ask-with-image', [], async ({ req, res }) => {
    try {
      await readStream(req) // consume body to avoid socket hang up
      res.statusCode = 200
      res.end(
        JSON.stringify({
          reply:
            'Imagem recebida. Em breve, enviaremos uma análise detalhada. Enquanto isso, descreva o problema para agilizar.',
        })
      )
    } catch (error) {
      console.error('[ASK-WITH-IMAGE] Failed to process request', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Internal server error' }))
    }
  })

  router.post('/api/register-user', [], async ({ req, res }) => {
    try {
      const body = await parseJsonBody(req)
      const validation = registerUserSchema.safeParse(body)

      if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors
        res.statusCode = 400
        res.end(JSON.stringify({ message: 'Invalid request body', errors }))
        return
      }

      await saveUser(validation.data)

      res.statusCode = 201
      res.end(JSON.stringify({ message: 'Usuário registrado com sucesso.' }))
    } catch (error) {
      console.error('[REGISTER-USER] Failed to process request', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Internal server error' }))
    }
  })

  router.post('/api/suggest-knowledge', [], async ({ req, res }) => {
    try {
      const body = await parseJsonBody(req)
      const validation = suggestionSchema.safeParse(body)

      if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors
        res.statusCode = 400
        res.end(JSON.stringify({ message: 'Invalid request body', errors }))
        return
      }

      await saveSuggestion(validation.data)

      res.statusCode = 200
      res.end(JSON.stringify({ message: 'Sugestão recebida. Obrigado por ajudar a melhorar!' }))
    } catch (error) {
      console.error('[SUGGEST-KNOWLEDGE] Failed to process request', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Internal server error' }))
    }
  })
}
