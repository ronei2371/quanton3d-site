import { getDb } from './mongo.js'

const COLLECTION = 'users'

export async function saveUser(user) {
  try {
    const db = await getDb()
    const collection = db.collection(COLLECTION)
    await collection.insertOne({
      ...user,
      createdAt: new Date(),
    })
  } catch (error) {
    console.warn('[USERS] Failed to persist user to MongoDB', error?.message)
  }
}
