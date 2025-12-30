import fs from 'node:fs'
import fsp from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { z } from 'zod'

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return

  const content = fs.readFileSync(envPath, 'utf-8')
  content.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const [key, ...rest] = trimmed.split('=')
    if (!key) return
    const value = rest.join('=').trim()
    if (value && !process.env[key]) {
      process.env[key] = value
    }
  })
}

loadEnvFile()

const distDir = path.resolve(process.cwd(), 'dist')
const indexFile = path.join(distDir, 'index.html')
const statusFile = path.join(distDir, 'status.html')
const dataDir = path.resolve(process.cwd(), 'backend', 'data')

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://quanton3dia.onrender.com,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const port = process.env.PORT || 10000
const healthServiceName = 'Quanton3D ChatBot'
const maxBodySize = 5 * 1024 * 1024 // 5MB

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const systemPrompt = `Você é um assistente virtual especializado da Quanton3D, empresa brasileira de resinas UV de alta performance para impressão 3D.

INFORMAÇÕES DA EMPRESA:
- Nome: Quanton3D
- Localização: Av. Dom Pedro II, 5056 - Jardim Montanhês, Belo Horizonte - MG
- Telefone: (31) 3271-6935
- WhatsApp: (31) 3271-6935
- Site: https://quanton3d.com.br

LINHAS DE PRODUTOS:

1. ACTION FIGURES:
   - Alchemist: Efeitos especiais translúcidos
   - FlexForm: Flexível, resistente à abrasão
   - Iron: Ultra resistente, alta dureza
   - 70/30: Miniaturas detalhadas
   - RPG: Miniaturas de RPG
   - Poseidon: Grandes formatos
   - PyroBlast: Alta velocidade de cura
   - Spark: Lavável em água
   - Spin: Versatilidade geral

2. ODONTOLOGIA:
   - Alinhadores: Para alinhadores dentários
   - Dental: Modelos dentais precisos
   - Gengiva: Simulação de gengiva
   - Washable: Lavável em água

3. ENGENHARIA:
   - FlexForm: Protótipos flexíveis
   - Iron: Peças resistentes
   - 70/30: Precisão dimensional
   - RPG: Detalhamento fino
   - Vulcan Cast: Fundição (até 250°C)

4. JOALHERIA:
   - Vulcan Cast: Fundição de joias (até 250°C)

5. USO GERAL:
   - Alchemist: Translúcida versátil
   - Low Smell: Baixo odor
   - Poseidon: Grandes formatos
   - PyroBlast: Cura rápida
   - Spare: Econômica
   - Spare Washable: Econômica lavável
   - Spark: Versátil lavável
   - Spin: Uso geral

COMPATIBILIDADE:
- Todas as resinas são compatíveis com impressoras DLP e LCD
- Comprimento de onda: 395-405nm

INSTRUÇÕES:
- Seja cordial e prestativo
- Responda em português brasileiro
- Seja específico e técnico quando necessário
- Ofereça sugestões de produtos adequados
- Se não souber, seja honesto e sugira contato direto
- Sempre forneça os contatos da empresa quando relevante`

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
      .min(1, 'sessionId cannot be empty')
      .optional(),
    conversationHistory: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string().trim(),
        })
      )
      .optional(),
    image: z
      .object({
        data: z.string().min(1),
        type: z.string().min(1).default('image/png'),
      })
      .optional(),
  })
  .strict()

const registerSchema = z
  .object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
    resin: z.string().min(1),
    problemType: z.string().min(1),
    sessionId: z.string().optional(),
  })
  .strict()

const suggestionSchema = z
  .object({
    suggestion: z.string().min(1),
    userName: z.string().optional(),
    userPhone: z.string().optional(),
    sessionId: z.string().optional(),
    lastUserMessage: z.string().optional(),
    lastBotReply: z.string().optional(),
  })
  .strict()

async function fileExists(filePath) {
  try {
    await fsp.access(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return mimeTypes[ext] || 'application/octet-stream'
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || ''
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}

async function serveFile(filePath, res, req) {
  if (!(await fileExists(filePath))) return false

  setCorsHeaders(req, res)
  res.statusCode = 200
  res.setHeader('Content-Type', getMimeType(filePath))
  const stream = fs.createReadStream(filePath)
  stream.pipe(res)
  return true
}

async function serveStaticAsset(pathname, res, req) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname
  const filePath = path.join(distDir, decodeURIComponent(requestedPath))

  if (await fileExists(filePath)) {
    return serveFile(filePath, res, req)
  }

  if (await fileExists(indexFile)) {
    return serveFile(indexFile, res, req)
  }

  return false
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''

    req.on('data', (chunk) => {
      data += chunk
      if (data.length > maxBodySize) {
        reject(new Error('Request body too large'))
      }
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

function filterHistory(history = []) {
  if (!Array.isArray(history)) return []
  return history
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: typeof item.content === 'string' ? item.content : '',
    }))
    .filter((item) => item.content.trim())
}

async function callAnthropic({ message, history, image }) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada')
  }

  const content = []
  if (image?.data) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: image.type || 'image/png',
        data: image.data,
      },
    })
  }
  content.push({ type: 'text', text: message })

  const messages = [...filterHistory(history).map((item) => ({ role: item.role, content: [{ type: 'text', text: item.content }] })), { role: 'user', content }]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      system: systemPrompt,
      messages,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro Anthropic (${response.status}): ${errorText}`)
  }

  const payload = await response.json()
  const text = payload.content?.map((item) => item.text).filter(Boolean).join('\n').trim()
  return text || 'Não consegui gerar uma resposta agora. Tente novamente.'
}

async function callOpenAI({ message, history, image }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada')
  }

  const baseMessages = [
    { role: 'system', content: systemPrompt },
    ...filterHistory(history).map((item) => ({ role: item.role, content: item.content })),
  ]

  const userContent = image?.data
    ? [
        { type: 'text', text: message },
        { type: 'image_url', image_url: { url: `data:${image.type || 'image/png'};base64,${image.data}` } },
      ]
    : message

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [...baseMessages, { role: 'user', content: userContent }],
      max_tokens: 800,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro OpenAI (${response.status}): ${errorText}`)
  }

  const payload = await response.json()
  const text = payload.choices?.[0]?.message?.content?.trim()
  return text || 'Não consegui gerar uma resposta agora. Tente novamente.'
}

async function generateAiReply({ message, history, image }) {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await callAnthropic({ message, history, image })
    } catch (error) {
      console.error('[AI] Falha Anthropic, tentando OpenAI', error)
    }
  }

  if (process.env.OPENAI_API_KEY) {
    return callOpenAI({ message, history, image })
  }

  throw new Error('Configure ANTHROPIC_API_KEY ou OPENAI_API_KEY')
}

async function saveDataFile(filename, payload) {
  await fsp.mkdir(dataDir, { recursive: true })
  const filePath = path.join(dataDir, filename)
  let current = []
  if (await fileExists(filePath)) {
    const content = await fsp.readFile(filePath, 'utf-8')
    current = JSON.parse(content || '[]')
  }
  current.push({ ...payload, timestamp: new Date().toISOString() })
  await fsp.writeFile(filePath, JSON.stringify(current, null, 2))
}

async function handleAsk(req, res, body, pathname) {
  const validation = askSchema.safeParse(body)

  if (!validation.success) {
    res.statusCode = 400
    res.end(JSON.stringify({ message: 'Invalid request body', errors: validation.error.flatten().fieldErrors }))
    return
  }

  const { message, sessionId, conversationHistory, image } = validation.data
  const reply = await generateAiReply({ message, history: conversationHistory, image })

  res.statusCode = 200
  res.end(
    JSON.stringify({
      reply,
      response: reply,
      sessionId,
      route: pathname,
      timestamp: new Date().toISOString(),
    })
  )
}

async function handleRegister(req, res, body) {
  const validation = registerSchema.safeParse(body)
  if (!validation.success) {
    res.statusCode = 400
    res.end(JSON.stringify({ message: 'Invalid request body', errors: validation.error.flatten().fieldErrors }))
    return
  }

  await saveDataFile('registrations.json', validation.data)
  res.statusCode = 201
  res.end(JSON.stringify({ message: 'Dados recebidos com sucesso.' }))
}

async function handleSuggestion(req, res, body) {
  const validation = suggestionSchema.safeParse(body)
  if (!validation.success) {
    res.statusCode = 400
    res.end(JSON.stringify({ message: 'Invalid request body', errors: validation.error.flatten().fieldErrors }))
    return
  }

  await saveDataFile('suggestions.json', validation.data)
  res.statusCode = 201
  res.end(JSON.stringify({ message: 'Sugestão registrada. Obrigado!' }))
}

function writeHealth(res, req) {
  setCorsHeaders(req, res)
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(
    JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: healthServiceName,
    })
  )
}

function writeProducts(res, req) {
  setCorsHeaders(req, res)
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(
    JSON.stringify({
      categories: [
        {
          name: 'Action Figures',
          products: ['Alchemist', 'FlexForm', 'Iron', '70/30', 'RPG', 'Poseidon', 'PyroBlast', 'Spark', 'Spin'],
        },
        {
          name: 'Odontologia',
          products: ['Alinhadores', 'Dental', 'Gengiva', 'Washable'],
        },
        {
          name: 'Engenharia',
          products: ['FlexForm', 'Iron', '70/30', 'RPG', 'Vulcan Cast'],
        },
        {
          name: 'Joalheria',
          products: ['Vulcan Cast'],
        },
        {
          name: 'Uso Geral',
          products: ['Alchemist', 'Low Smell', 'Poseidon', 'PyroBlast', 'Spare', 'Spare Washable', 'Spark', 'Spin'],
        },
      ],
    })
  )
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

  try {
    setCorsHeaders(req, res)

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    if (req.method === 'GET' && (pathname === '/status' || pathname === '/status.html')) {
      const servedStatus = await serveFile(statusFile, res, req)
      if (servedStatus) return
    }

    if (req.method === 'GET' && pathname === '/health') {
      writeHealth(res, req)
      return
    }

    if (req.method === 'GET' && pathname === '/api/products') {
      writeProducts(res, req)
      return
    }

    if (req.method === 'POST' && (pathname === '/api/ask' || pathname === '/api/chat' || pathname === '/ask')) {
      res.setHeader('Content-Type', 'application/json')
      const body = await parseJsonBody(req)
      await handleAsk(req, res, body, pathname)
      return
    }

    if (req.method === 'POST' && pathname === '/api/ask-with-image') {
      res.setHeader('Content-Type', 'application/json')
      const body = await parseJsonBody(req)
      await handleAsk(req, res, body, pathname)
      return
    }

    if (req.method === 'POST' && pathname === '/api/register-user') {
      res.setHeader('Content-Type', 'application/json')
      const body = await parseJsonBody(req)
      await handleRegister(req, res, body)
      return
    }

    if (req.method === 'POST' && pathname === '/api/suggest-knowledge') {
      res.setHeader('Content-Type', 'application/json')
      const body = await parseJsonBody(req)
      await handleSuggestion(req, res, body)
      return
    }

    if (req.method === 'GET') {
      const served = await serveStaticAsset(pathname, res, req)
      if (served) return
    }

    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ message: 'Not Found' }))
  } catch (error) {
    console.error('[SERVER] Unhandled error', error)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        message: 'Erro interno do servidor',
        details: error.message,
      })
    )
  }
})

server.listen(port, () => {
  console.log(`[ASK] Bot service listening on port ${port}`)
  console.log(`[ASK] Health check: http://localhost:${port}/health`)
})

export default server
