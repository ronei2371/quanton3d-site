export function authAdmin({ req, res }) {
  const authHeader = req.headers['authorization'] || ''
  const [scheme, token] = authHeader.split(' ')
  const adminToken = process.env.ADMIN_API_TOKEN || 'changeme'

  if (!adminToken) {
    console.error('[AUTH-ADMIN] ADMIN_API_TOKEN is not configured')
    res.statusCode = 500
    res.end(JSON.stringify({ message: 'Admin authentication is not configured.' }))
    return false
  }

  if (scheme !== 'Bearer' || token !== adminToken) {
    res.statusCode = 401
    res.end(JSON.stringify({ message: 'Unauthorized: invalid admin token.' }))
    return false
  }

  return true
}
