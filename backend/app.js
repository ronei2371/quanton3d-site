import fs from 'node:fs'
import fsp from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { buildRouter } from './routes/index.js'

const router = buildRouter()
const port = process.env.PORT || 4000

const distDir = path.resolve(process.cwd(), 'dist')
const indexFile = path.join(distDir, 'index.html')

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

async function serveStatic(req, res) {
  // Parse URL safely even if host header is missing
  const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const requestedPath = pathname === '/' ? '/index.html' : pathname
  let filePath = path.join(distDir, decodeURIComponent(requestedPath))

  if (!(await fileExists(filePath))) {
    // SPA fallback
    filePath = indexFile
    if (!(await fileExists(filePath))) {
      return false
    }
  }

  res.statusCode = 200
  res.setHeader('Content-Type', getMimeType(filePath))
  const stream = fs.createReadStream(filePath)
  stream.pipe(res)
  return true
}

const server = http.createServer(async (req, res) => {
  // First, try API routes
  const handled = await router.handle(req, res)
  if (handled === true) return

  // Then, try static assets (built React app)
  const served = await serveStatic(req, res)
  if (served === true) return

  // If nothing matched, respond 404 JSON
  res.statusCode = 404
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ message: 'Not Found' }))
})

server.listen(port, () => {
  console.log(`[IMPORT-KNOWLEDGE] Admin knowledge service listening on port ${port}`)
})

export default server
