import http from 'node:http'
import { buildRouter } from './routes/index.js'

const router = buildRouter()
const port = process.env.PORT || 4000

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  await router.handle(req, res)
})

server.listen(port, () => {
  console.log(`[IMPORT-KNOWLEDGE] Admin knowledge service listening on port ${port}`)
})

export default server
