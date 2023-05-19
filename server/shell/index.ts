import { IncomingMessage, ServerResponse } from 'node:http'
import pty from 'node-pty'

let shell = {
  client: null as pty.IPty | null,
  data: '',
}

export const createShell = () => {
  const subs = new Set<ServerResponse>()

  return async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === 'GET') {
      let id = subs.size
      subs.add(res)
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })
      if (!shell.client) {
        shell.client = pty.spawn('bash', [], {
          name: 'xterm-color',
          env: { ...(process.env as any) },
        })
        shell.client.onData((x) => {
          shell.data += x
          const v = Buffer.from(x).toString('base64')
          subs.forEach((res) => {
            res.write(`id: ${id}\n`)
            res.write(`event: stdout\ndata:${v}\n\n\n`)
          })
        })
      } else {
        const v = Buffer.from(shell.data).toString('base64')
        res.write(`id: ${id}\n`)
        res.write(`event: stdout\ndata:${v}\n\n\n`)
      }
      res.on('close', () => {
        subs.delete(res)
        console.log('\n\nclose\n\n')
      })
      return
    }

    if (req.method === 'POST') {
      const body = await getBody(req)
      shell.client?.write(body)
      res.writeHead(200, {})
      res.end('')
    }
  }
}

const getBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    let body: any[] = []
    req
      .on('data', (chunk) => body.push(chunk))
      .on('end', () => resolve(Buffer.concat(body).toString()))
      .on('error', (e) => reject(e))
  })
