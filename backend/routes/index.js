import { registerAdminKnowledgeRoutes } from './adminKnowledge.js'
import { registerAskRoutes } from './ask.js'
import { registerPartnersRoutes } from './partners.js'

const normalizePath = (path) => {
  if (path === '/') return '/'
  return path.endsWith('/') ? path.slice(0, -1) : path
}

const matchPath = (routePath, requestPath) => {
  const routeSegments = normalizePath(routePath).split('/').filter(Boolean)
  const requestSegments = normalizePath(requestPath).split('/').filter(Boolean)

  if (routeSegments.length !== requestSegments.length) return null

  const params = {}

  for (let i = 0; i < routeSegments.length; i += 1) {
    const routeSegment = routeSegments[i]
    const requestSegment = requestSegments[i]

    if (routeSegment.startsWith(':')) {
      params[routeSegment.slice(1)] = decodeURIComponent(requestSegment)
      continue
    }

    if (routeSegment !== requestSegment) {
      return null
    }
  }

  return params
}

export class Router {
  constructor() {
    this.routes = []
  }

  addRoute(method, path, middlewares = [], handler) {
    this.routes.push({ method, path: normalizePath(path), middlewares, handler })
  }

  get(path, middlewares = [], handler) {
    this.addRoute('GET', path, middlewares, handler)
  }

  post(path, middlewares = [], handler) {
    this.addRoute('POST', path, middlewares, handler)
  }

  put(path, middlewares = [], handler) {
    this.addRoute('PUT', path, middlewares, handler)
  }

  delete(path, middlewares = [], handler) {
    this.addRoute('DELETE', path, middlewares, handler)
  }

  options(path, middlewares = [], handler) {
    this.addRoute('OPTIONS', path, middlewares, handler)
  }

  async handle(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    const normalizedRequestPath = normalizePath(url.pathname)
    const pathVariants = [normalizedRequestPath]

    if (normalizedRequestPath.startsWith('/api')) {
      const trimmed = normalizedRequestPath.slice('/api'.length) || '/'
      pathVariants.push(normalizePath(trimmed))
    }

    let matchedRoute = null
    let params = {}

    for (const route of this.routes) {
      if (route.method !== req.method) continue

      for (const pathVariant of pathVariants) {
        const match = matchPath(route.path, pathVariant)
        if (match) {
          matchedRoute = route
          params = match
          break
        }
      }

      if (matchedRoute) {
        break
      }
    }

    if (!matchedRoute) {
      return false
    }

    res.setHeader('Content-Type', 'application/json')
    const context = { req, res, params, query: url.searchParams }

    for (const middleware of matchedRoute.middlewares) {
      const result = await middleware(context)
      if (result === false) return true
    }

    await matchedRoute.handler(context)

    return true
  }
}

export function buildRouter() {
  const router = new Router()
  registerAskRoutes(router)
  registerAdminKnowledgeRoutes(router)
  registerPartnersRoutes(router)
  return router
}
