import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import crypto from 'node:crypto'

const DATA_DIR = join(process.cwd(), 'backend', 'data')
const DATA_FILE = join(DATA_DIR, 'documents.json')

function ensureStorage() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, '[]', 'utf-8')
  }
}

function loadDocuments() {
  ensureStorage()
  const buffer = readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(buffer)
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return []
  return tags
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean)
}

function saveDocuments(documents) {
  writeFileSync(DATA_FILE, JSON.stringify(documents, null, 2))
}

export class DocumentModel {
  static async insertMany(documents) {
    const now = new Date().toISOString()
    const existing = loadDocuments()
    const payload = documents.map((doc) => ({
      _id: crypto.randomUUID(),
      title: doc.title,
      content: doc.content,
      embedding: doc.embedding ?? [],
      tags: normalizeTags(doc.tags),
      source: doc.source?.trim() || null,
      createdAt: now,
      updatedAt: now,
    }))

    const merged = [...existing, ...payload]
    saveDocuments(merged)
    return payload
  }

  static async findAll() {
    return loadDocuments()
  }
}
