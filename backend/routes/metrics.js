import os from 'node:os'
import process from 'node:process'
import { getDbStatus } from '../services/mongo.js'

export const registerMetricsRoutes = (router) => {
  router.options('/api/metrics', [], async ({ res }) => {
    res.statusCode = 204
    res.end()
  })

  router.get('/api/metrics', [], async ({ res }) => {
    try {
      const dbStatus = await getDbStatus()
      res.statusCode = 200
      res.end(
        JSON.stringify({
          status: 'ok',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          hostname: os.hostname(),
          db: dbStatus,
          timestamp: new Date().toISOString(),
        })
      )
    } catch (error) {
      console.error('[METRICS] Failed to fetch metrics', error)
      res.statusCode = 500
      res.end(JSON.stringify({ status: 'error', message: 'Failed to fetch metrics.' }))
    }
  })
}
