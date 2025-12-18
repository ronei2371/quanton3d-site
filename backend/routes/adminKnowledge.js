import { z } from 'zod'
import { DocumentModel } from '../models/Document.js'
import { generateEmbedding } from '../services/embeddings.js'
import { authAdmin } from '../middleware/authAdmin.js'

const documentSchema = z.object({
  title: z.string().min(1, 'title is required'),
  content: z.string().min(1, 'content is required'),
  tags: z
    .preprocess(
      (val) => {
        if (Array.isArray(val)) return val
        if (typeof val === 'string' && val.trim()) return val.split(',').map((tag) => tag.trim())
        return []
      },
      z.array(z.string()).default([])
    )
    .refine((tags) => Array.isArray(tags), { message: 'tags must be an array' }),
  source: z.string().trim().optional(),
})

const importSchema = z.object({
  documents: z.array(documentSchema).nonempty('at least one document is required'),
})

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'))
      } catch (error) {
        reject(error)
      }
    })
  })
}

export const registerAdminKnowledgeRoutes = (router) => {
  router.post('/admin/knowledge/import', [authAdmin], async ({ req, res }) => {
    try {
      const body = await parseBody(req)
      const validation = importSchema.safeParse(body)

      if (!validation.success) {
        const message = validation.error.errors.map((err) => err.message).join('; ')
        console.error('[IMPORT-KNOWLEDGE] Validation failed', validation.error.flatten())
        res.statusCode = 400
        res.end(JSON.stringify({ message }))
        return
      }

      const { documents } = validation.data
      const payload = await Promise.all(
        documents.map(async (doc) => ({
          ...doc,
          embedding: await generateEmbedding(`${doc.title}\n${doc.content}`),
        }))
      )

      const createdDocs = await DocumentModel.insertMany(payload)
      console.info(`[IMPORT-KNOWLEDGE] Successfully imported ${createdDocs.length} documents`)

      res.statusCode = 201
      res.end(
        JSON.stringify({
          message: 'Documents imported successfully.',
          count: createdDocs.length,
          documents: createdDocs,
        })
      )
    } catch (error) {
      console.error('[IMPORT-KNOWLEDGE] Failed to import documents', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Failed to import documents.' }))
    }
  })
}
