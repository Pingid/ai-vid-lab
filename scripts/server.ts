import { execSync } from 'node:child_process'
import { createServer } from 'node:http'
import path from 'node:path'
import fs from 'node:fs'

import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import { createShell } from '../server/shell'
import { appRouter } from '../server/trpc'

const trpc = { port: process.env.PORT ? parseInt(process.env.PORT) : 8001, hostname: process.env.HOST || 'localhost' }

;(() => {
  const shell = createShell()

  createServer(async (req, res) => {
    try {
      if (!req.url) return

      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Request-Method', '*')
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, HEAD')
      res.setHeader('Access-Control-Allow-Headers', '*')

      if (/api/.test(req.url)) req.url = req.url.replace('/api', '')

      if (/trpc/.test(req.url)) {
        req.url = req.url.replace('/trpc', '')
        return createHTTPHandler({ router: appRouter })(req, res)
      }
      if (/shell/.test(req.url)) {
        req.url = req.url.replace('/shell', '')
        return shell(req, res)
      }

      if (/assets/.test(req.url)) {
        req.url = `/static${path.join(__dirname, '../dist/assets', req.url.replace('/assets', ''))}`
      }

      if (/static/.test(req.url)) {
        const pth = req.url.replace('/static', '')
        if (fs.existsSync(pth)) {
          const stat = await fs.promises.stat(pth)
          const mime = await (() => {
            if (/\.js/.test(pth)) return 'text/javascript'
            if (/\.html/.test(pth)) return 'text/html'
            if (/\.css/.test(pth)) return 'text/css'
            return get_mime_type(pth)
          })()

          if (!mime) return res.end()
          res.writeHead(200, { 'Content-Type': mime, 'Content-Length': stat.size })
          const stream = fs.createReadStream(pth)
          stream.pipe(res)
          return
        }
      }

      res.writeHead(200, { 'Content-Type': 'text/html' })
      const stream = fs.createReadStream(path.join(__dirname, '../dist/index.html'))
      stream.pipe(res)
    } catch (e) {
      console.error(e)
      res.writeHead(200, { 'Content-Type': 'text/html' })
      const stream = fs.createReadStream(path.join(__dirname, '../dist/index.html'))
      stream.pipe(res)
    }
  }).listen(trpc.port, trpc.hostname, () => {
    console.log(`listening on http://${trpc.hostname}:${trpc.port}`)
  })
})()

const get_mime_type = (pth: string) => {
  try {
    const result = execSync(`file --mime-type -b ${pth}`)
    return result.toString().trim()
  } catch (e) {
    return null
  }
}
