import crypto from 'node:crypto'

export async function generateEmbedding(text) {
  const hash = crypto.createHash('sha256').update(text).digest('hex')
  const embedding = []

  for (let i = 0; i < hash.length; i += 8) {
    const chunk = hash.slice(i, i + 8)
    embedding.push(parseInt(chunk, 16) / 0xffffffff)
  }

  return embedding
}
