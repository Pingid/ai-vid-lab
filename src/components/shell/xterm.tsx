import { onCleanup } from 'solid-js'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'

export const Xterm = (p: { ws: string }) => {
  const ref = bind_shell(p.ws)
  return <div ref={ref} />
}

const http = () => {
  return {
    close: () => {},
    send: (x: string) => fetch('/api/shell', { method: 'POST', body: x }),
    listen: (cb: (x: string) => void) => {
      const sse = new EventSource('/api/shell')
      const handler = (x: MessageEvent) => cb(atob(x.data))
      sse.addEventListener('stdout', handler)
      return () => sse.close()
    },
  }
}

const bind_shell = (url: string) => {
  let unsubs: (() => void)[] = []
  const onClose = () => unsubs.forEach((fn) => fn())
  onCleanup(onClose)
  return (node?: HTMLElement | null) => {
    if (!node) return onClose()
    const term = new Terminal({ cursorBlink: true })
    term.open(node)
    const sock = http()
    setTimeout(() => term.focus(), 100)
    unsubs.push(sock.listen((x) => term.write(x)))
    start(term, (x) => sock.send(x))
  }
}

const start = (term: Terminal, send: (x: string) => void) => {
  let command = ''

  const run = (command: string) => {
    if (command.length <= 0) return
    for (let i = 0; i < command.length; i++) {
      term.write('\b \b')
    }
    send(command + '\n')
  }

  term.write('\r\n$ ')

  term.onData((e) => {
    switch (e) {
      case '\u0003': // Ctrl+C
        term.write('^C')
        command = ''
        term.write('\r\n$ ')
        break
      case '\r': // Enter
        run(command)
        command = ''
        break
      case '\u007F': // Backspace (DEL)
        // Do not delete the prompt
        if ((term as any)._core.buffer.x > 2) {
          term.write('\b \b')
          if (command.length > 0) {
            command = command.substr(0, command.length - 1)
          }
        }
        break
      case '\u0009':
        break
      default:
        if ((e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7e)) || e >= '\u00a0') {
          command += e
          term.write(e)
        }
    }
  })
}
