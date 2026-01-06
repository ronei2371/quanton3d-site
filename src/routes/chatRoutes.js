import express from 'express'
import rateLimit from 'express-rate-limit'
import multer from 'multer'

const router = express.Router()

const askRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown',
  message: {
    success: false,
    error: 'Muitas requisições. Aguarde um momento antes de tentar novamente.',
  },
})

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '')

const validateAskBody = (req, res, next) => {
  const message = normalizeText(req.body?.message)
  const sessionId = normalizeText(req.body?.sessionId)

  if (!message || !sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request body',
      errors: {
        ...(message ? {} : { message: ['message cannot be empty'] }),
        ...(sessionId ? {} : { sessionId: ['sessionId cannot be empty'] }),
      },
    })
  }

  req.body.message = message
  req.body.sessionId = sessionId
  return next()
}

const validateRegisterBody = (req, res, next) => {
  const name = normalizeText(req.body?.name)
  const phone = normalizeText(req.body?.phone)
  const email = normalizeText(req.body?.email)
  const resin = normalizeText(req.body?.resin)
  const problemType = normalizeText(req.body?.problemType)
  const sessionId = normalizeText(req.body?.sessionId)

  const errors = {}
  if (!name) errors.name = ['name is required']
  if (!phone) errors.phone = ['phone is required']
  if (!email || !email.includes('@')) errors.email = ['email must be valid']
  if (!resin) errors.resin = ['resin is required']
  if (!problemType) errors.problemType = ['problemType is required']
  if (!sessionId) errors.sessionId = ['sessionId is required']

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request body',
      errors,
    })
  }

  Object.assign(req.body, { name, phone, email, resin, problemType, sessionId })
  return next()
}

router.post('/ask', askRateLimiter, validateAskBody, (req, res) => {
  const { message, sessionId } = req.body
  return res.status(200).json({
    success: true,
    reply: 'Mensagem recebida para processamento seguro.',
    sessionId,
    received: { message },
  })
})

router.post('/chat', askRateLimiter, validateAskBody, (req, res) => {
  const { message, sessionId } = req.body
  return res.status(200).json({
    success: true,
    reply: 'Mensagem recebida para processamento seguro.',
    sessionId,
    received: { message },
  })
})

router.post('/ask-with-image', askRateLimiter, upload.single('image'), (req, res) => {
  const message = normalizeText(req.body?.message) || 'Imagem enviada'
  const sessionId = normalizeText(req.body?.sessionId) || 'session-image'

  return res.status(200).json({
    success: true,
    reply: 'Imagem recebida para processamento seguro.',
    sessionId,
    received: { message, hasImage: Boolean(req.file) },
  })
})

router.post('/register-user', askRateLimiter, validateRegisterBody, (req, res) => {
  return res.status(201).json({
    success: true,
    message: 'Usuário registrado com sucesso.',
    user: req.body,
  })
})

router.post('/suggest-knowledge', askRateLimiter, (req, res) => {
  const suggestion = normalizeText(req.body?.suggestion)
  const payload = {
    suggestion,
    userName: normalizeText(req.body?.userName),
    userPhone: normalizeText(req.body?.userPhone),
    sessionId: normalizeText(req.body?.sessionId),
    lastUserMessage: normalizeText(req.body?.lastUserMessage),
    lastBotReply: normalizeText(req.body?.lastBotReply),
  }

  if (!suggestion) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request body',
      errors: { suggestion: ['suggestion cannot be empty'] },
    })
  }

  return res.status(200).json({
    success: true,
    message: 'Sugestão recebida. Obrigado por colaborar com o conhecimento do bot.',
    suggestion: payload,
  })
})

export default router
