const adminToken = process.env.ADMIN_API_TOKEN?.trim()

if (!adminToken || adminToken === 'changeme') {
  throw new Error('[AUTH-ADMIN] ADMIN_API_TOKEN is not configured')
}

export function authAdmin({ req, res }) {
  const authHeader = req.headers['authorization'] || ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || token !== adminToken) {
    res.statusCode = 401
    res.end(JSON.stringify({ message: 'Unauthorized: invalid admin token.' }))
    return false
  }

  return true
}
