import fs from 'node:fs'
import fsp from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { z } from 'zod'

const distDir = path.resolve(process.cwd(), 'dist')
const indexFile = path.join(distDir, 'index.html')
const statusFile = path.join(distDir, 'status.html')

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

async function serveFile(filePath, res) {
  if (!(await fileExists(filePath))) return false

  res.statusCode = 200
  res.setHeader('Content-Type', getMimeType(filePath))
  const stream = fs.createReadStream(filePath)
  stream.pipe(res)
  return true
}

async function serveStaticAsset(pathname, res) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname
  const filePath = path.join(distDir, decodeURIComponent(requestedPath))

  if (await fileExists(filePath)) {
    return serveFile(filePath, res)
  }

  if (await fileExists(indexFile)) {
    return serveFile(indexFile, res)
  }

  return false
}

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
  const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'POST' && pathname === '/ask') {
    res.setHeader('Content-Type', 'application/json')
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

  if (req.method === 'GET' && (pathname === '/status' || pathname === '/status.html')) {
    const servedStatus = await serveFile(statusFile, res)
    if (servedStatus) return
  }

  if (req.method === 'GET') {
    const served = await serveStaticAsset(pathname, res)
    if (served) return
  }

  res.statusCode = 404
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ message: 'Not Found' }))
})

const port = process.env.PORT || 4000

server.listen(port, () => {
  console.log(`[ASK] Bot service listening on port ${port}`)
})

export default server
