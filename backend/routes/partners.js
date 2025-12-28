import crypto from 'node:crypto'

const ASTRA_DB_API_ENDPOINT = process.env.ASTRA_DB_API_ENDPOINT
const ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN
const COLLECTION_NAME = 'partners'

const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}

const hasCloudinaryConfig =
  cloudinaryConfig.cloudName && cloudinaryConfig.apiKey && cloudinaryConfig.apiSecret

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
}

const parseJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })

const readRequestBuffer = (req) =>
  new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })

const parseMultipartFiles = async (req) => {
  const contentType = req.headers['content-type'] || ''
  const boundaryMatch = contentType.match(/boundary=(.+)$/)
  if (!boundaryMatch) throw new Error('Multipart boundary not found.')

  const boundary = boundaryMatch[1]
  const bodyBuffer = await readRequestBuffer(req)
  const bodyString = bodyBuffer.toString('binary')
  const parts = bodyString
    .split(`--${boundary}`)
    .filter((part) => part.trim() && part.trim() !== '--')

  const files = []

  for (const part of parts) {
    const trimmedPart = part.trim()
    const [rawHeaders, rawContent] = trimmedPart.split('\r\n\r\n')
    if (!rawContent) continue

    const dispositionMatch = rawHeaders.match(
      /name="([^"]+)"(?:;\s*filename="([^"]+)")?/i
    )
    const contentTypeMatch = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i)

    const content = rawContent.replace(/\r\n$/, '')
    const fileBuffer = Buffer.from(content, 'binary')

    files.push({
      fieldName: dispositionMatch?.[1],
      filename: dispositionMatch?.[2] || 'upload',
      contentType: contentTypeMatch?.[1] || 'application/octet-stream',
      data: fileBuffer,
    })
  }

  return files
}

const astraRequest = async (path, method, body) => {
  if (!ASTRA_DB_API_ENDPOINT || !ASTRA_DB_APPLICATION_TOKEN) {
    throw new Error('Astra DB credentials are not configured')
  }

  const url = new URL(path.replace(/^\//, ''), `${ASTRA_DB_API_ENDPOINT.replace(/\/$/, '')}/`)
  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Cassandra-Token': ASTRA_DB_APPLICATION_TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMessage =
      json?.description || json?.message || `Astra request failed with status ${response.status}`
    throw new Error(errorMessage)
  }

  return json
}

const listPartners = async (filter, options) => {
  const response = await astraRequest(
    `collections/${COLLECTION_NAME}/find`,
    'POST',
    { filter, options }
  )
  return response?.data?.documents || response?.documents || []
}

const findPartnerById = async (id) => {
  try {
    const response = await astraRequest(
      `collections/${COLLECTION_NAME}/findOne`,
      'POST',
      { filter: { _id: id } }
    )
    return response?.data?.document || response?.document || null
  } catch (error) {
    console.warn('[PARTNERS] findOne failed, falling back to find', error?.message)
    const fallback = await listPartners({ _id: id }, { limit: 1 })
    return fallback[0] || null
  }
}

const insertPartner = async (partner) => {
  try {
    await astraRequest(`collections/${COLLECTION_NAME}/documents`, 'POST', {
      documentId: partner._id,
      document: partner,
    })
  } catch (error) {
    console.warn('[PARTNERS] insert via documents failed, falling back to insertOne', error?.message)
    await astraRequest(`collections/${COLLECTION_NAME}/insertOne`, 'POST', {
      document: partner,
    })
  }
}

const updatePartner = async (id, updateData) => {
  try {
    return await astraRequest(`collections/${COLLECTION_NAME}/documents/${id}`, 'PUT', {
      document: updateData,
    })
  } catch (error) {
    console.warn('[PARTNERS] update via documents failed, falling back to updateOne', error?.message)
    return astraRequest(`collections/${COLLECTION_NAME}/updateOne`, 'POST', {
      filter: { _id: id },
      update: { $set: updateData },
    })
  }
}

const deletePartner = async (id) => {
  try {
    return await astraRequest(`collections/${COLLECTION_NAME}/documents/${id}`, 'DELETE')
  } catch (error) {
    console.warn('[PARTNERS] delete via documents failed, falling back to deleteOne', error?.message)
    return astraRequest(`collections/${COLLECTION_NAME}/deleteOne`, 'POST', {
      filter: { _id: id },
    })
  }
}

const uploadToCloudinary = async (file) => {
  const timestamp = Math.floor(Date.now() / 1000)
  const signatureBase = `timestamp=${timestamp}${cloudinaryConfig.apiSecret}`
  const signature = crypto.createHash('sha1').update(signatureBase).digest('hex')

  const form = new FormData()
  const blob = new Blob([file.data], { type: file.contentType })
  form.append('file', blob, file.filename)
  form.append('api_key', cloudinaryConfig.apiKey)
  form.append('timestamp', timestamp.toString())
  form.append('signature', signature)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
    {
      method: 'POST',
      body: form,
    }
  )

  const json = await response.json().catch(() => ({}))
  if (!response.ok || !json.secure_url) {
    const message = json?.error?.message || 'Failed to upload image.'
    throw new Error(message)
  }

  return {
    url: json.secure_url,
    public_id: json.public_id,
    width: json.width,
    height: json.height,
  }
}

const sendPreflight = ({ res }) => {
  setCorsHeaders(res)
  res.statusCode = 204
  res.end()
}

export const registerPartnersRoutes = (router) => {
  router.options('/api/partners', [], sendPreflight)
  router.options('/api/partners/:id', [], sendPreflight)
  router.options('/api/partners/upload-image', [], sendPreflight)

  router.get('/api/partners', [], async ({ res, query }) => {
    setCorsHeaders(res)
    try {
      const activeOnly = query.get('active') === 'true'
      const partners = await listPartners(
        activeOnly ? { is_active: true } : {},
        { sort: { display_order: 1, created_at: -1 } }
      )

      res.statusCode = 200
      res.end(JSON.stringify({ partners }))
    } catch (error) {
      console.error('[PARTNERS] Failed to list partners', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Failed to list partners.' }))
    }
  })

  router.get('/api/partners/:id', [], async ({ res, params }) => {
    setCorsHeaders(res)
    try {
      const partner = await findPartnerById(params.id)

      if (!partner) {
        res.statusCode = 404
        res.end(JSON.stringify({ message: 'Partner not found.' }))
        return
      }

      res.statusCode = 200
      res.end(JSON.stringify({ partner }))
    } catch (error) {
      console.error('[PARTNERS] Failed to fetch partner', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Failed to fetch partner.' }))
    }
  })

  router.post('/api/partners', [], async ({ req, res }) => {
    setCorsHeaders(res)
    try {
      const body = await parseJsonBody(req)

      if (!body.name || !body.description) {
        res.statusCode = 400
        res.end(JSON.stringify({ message: 'Name and description are required.' }))
        return
      }

      const now = new Date().toISOString()

      const newPartner = {
        _id: crypto.randomUUID(),
        name: body.name,
        description: body.description,
        phone: body.phone || '',
        email: body.email || '',
        website_url: body.website_url || '',
        course_url: body.course_url || '',
        instructor_1_name: body.instructor_1_name || '',
        instructor_1_description: body.instructor_1_description || '',
        instructor_1_phone: body.instructor_1_phone || '',
        instructor_2_name: body.instructor_2_name || '',
        instructor_2_description: body.instructor_2_description || '',
        instructor_2_phone: body.instructor_2_phone || '',
        highlights: Array.isArray(body.highlights) ? body.highlights : [],
        images: Array.isArray(body.images) ? body.images : [],
        is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
        display_order:
          body.display_order !== undefined ? Number(body.display_order) || 0 : 0,
        created_at: now,
        updated_at: now,
      }

      await insertPartner(newPartner)

      res.statusCode = 201
      res.end(JSON.stringify({ partner: newPartner }))
    } catch (error) {
      console.error('[PARTNERS] Failed to create partner', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Failed to create partner.' }))
    }
  })

  router.put('/api/partners/:id', [], async ({ req, res, params }) => {
    setCorsHeaders(res)
    try {
      const body = await parseJsonBody(req)
      const partnerId = params.id

      if (!partnerId) {
        res.statusCode = 400
        res.end(JSON.stringify({ message: 'Partner id is required.' }))
        return
      }

      const updateData = {
        ...body,
        updated_at: new Date().toISOString(),
      }
      delete updateData._id
      delete updateData.id

      await updatePartner(partnerId, updateData)
      const updatedPartner = await findPartnerById(partnerId)

      if (!updatedPartner) {
        res.statusCode = 404
        res.end(JSON.stringify({ message: 'Partner not found.' }))
        return
      }

      res.statusCode = 200
      res.end(JSON.stringify({ partner: updatedPartner }))
    } catch (error) {
      console.error('[PARTNERS] Failed to update partner', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Failed to update partner.' }))
    }
  })

  router.delete('/api/partners/:id', [], async ({ res, params }) => {
    setCorsHeaders(res)
    try {
      const partnerId = params.id
      const existing = await findPartnerById(partnerId)

      if (!existing) {
        res.statusCode = 404
        res.end(JSON.stringify({ message: 'Partner not found.' }))
        return
      }

      await deletePartner(partnerId)

      res.statusCode = 200
      res.end(JSON.stringify({ message: 'Partner deleted successfully.' }))
    } catch (error) {
      console.error('[PARTNERS] Failed to delete partner', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Failed to delete partner.' }))
    }
  })

  router.post('/api/partners/upload-image', [], async ({ req, res }) => {
    setCorsHeaders(res)

    if (!hasCloudinaryConfig) {
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Cloudinary credentials are not configured.' }))
      return
    }

    try {
      const files = await parseMultipartFiles(req)
      if (!files.length) {
        res.statusCode = 400
        res.end(JSON.stringify({ message: 'No file received for upload.' }))
        return
      }

      const uploads = []
      for (const file of files) {
        try {
          const result = await uploadToCloudinary(file)
          uploads.push(result)
        } catch (uploadError) {
          console.error('[PARTNERS] Failed to upload image to Cloudinary', uploadError)
        }
      }

      res.statusCode = 200
      res.end(
        JSON.stringify({
          success: true,
          images: uploads,
          imageUrl: uploads[0]?.url,
        })
      )
    } catch (error) {
      console.error('[PARTNERS] Failed to handle image upload', error)
      res.statusCode = 500
      res.end(JSON.stringify({ message: 'Failed to upload image.' }))
    }
  })
}
