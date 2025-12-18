import { registerAdminKnowledgeRoutes } from './adminKnowledge.js'

export class Router {
  constructor() {
    this.routes = []
  }

  post(path, middlewares = [], handler) {
    this.routes.push({ method: 'POST', path, middlewares, handler })
  }

  async handle(req, res) {
    const match = this.routes.find(
      (route) => route.method === req.method && route.path === req.url
    )

    if (!match) {
      res.statusCode = 404
      res.end(JSON.stringify({ message: 'Not Found' }))
      return
    }

    const context = { req, res }
    for (const middleware of match.middlewares) {
      const result = await middleware(context)
      if (result === false) return
    }

    await match.handler(context)
  }
}

export function buildRouter() {
  const router = new Router()
  registerAdminKnowledgeRoutes(router)
  return router
}
