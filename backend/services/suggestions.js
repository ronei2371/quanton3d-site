import { getDb } from './mongo.js'

const COLLECTION = 'suggestions'

export async function saveSuggestion(payload) {
  try {
    const db = await getDb()
    const collection = db.collection(COLLECTION)
    await collection.insertOne({
      ...payload,
      createdAt: new Date(),
    })
  } catch (error) {
    console.warn('[SUGGESTIONS] Failed to persist suggestion to MongoDB', error?.message)
  }
}
