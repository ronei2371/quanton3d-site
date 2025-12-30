import { MongoClient } from 'mongodb'

let client
let dbPromise

const uri = process.env.MONGODB_URI

export async function getDb() {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured')
  }

  if (!client) {
    client = new MongoClient(uri, {
      maxPoolSize: 5,
      minPoolSize: 0,
    })
  }

  if (!dbPromise) {
    dbPromise = client.connect().then((connected) => connected.db())
  }

  return dbPromise
}

export async function getDbStatus() {
  try {
    const db = await getDb()
    await db.command({ ping: 1 })
    return { status: 'connected' }
  } catch (error) {
    return { status: 'disconnected', message: error?.message }
  }
}

export async function closeDb() {
  if (client) {
    await client.close()
    client = null
    dbPromise = null
  }
}
