import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import chatRoutes from './src/routes/chatRoutes.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI || ''

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) || '*',
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log('[MongoDB] Conectado com sucesso')
    })
    .catch((error) => {
      console.error('[MongoDB] Falha na conexão', error)
    })
} else {
  console.warn('[MongoDB] MONGODB_URI não configurada; conexão não iniciada')
}

app.use('/api', chatRoutes)
app.use('/chat', chatRoutes)

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist')

  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Bot Quanton3D rodando na porta ${PORT}`)
})

export { app }
export default server
