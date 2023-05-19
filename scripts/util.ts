import { ChildProcess, exec, ExecOptions } from 'child_process'

export type Task<K extends string = never> = Omit<
  {
    name: (name: string) => Task<'name' | K>
    exec: (command: string, options?: ExecOptions) => Promise<{ stdout: string; stderr: string; code: number }>
  },
  K
>

export const task = (name?: string): Task => {
  let title = name || ''
  return {
    name: (n) => task(title + n),
    exec: (command, options) =>
      resolve({
        child: exec(command, {
          ...options,
          env: { ...process.env, ...options?.env, FORCE_COLOR: 'true' },
        }),
        prepend: `[${title}] `,
      }),
  }
}

export const pad = (n: number, x: string) => {
  if (x.length > n) return `${x.slice(0, n - 3)}...`
  return `${x}${' '.repeat(n - x.length)}`
}

export const join = <T extends Record<string, ChildProcess>>(x: T): Promise<{}> =>
  Promise.all(Object.entries(x).map(([title, child]) => resolve({ child, prepend: `[${title}] ` })))

export const resolve = ({ child, prepend }: { child: ChildProcess; prepend: string }) =>
  new Promise<{ stdout: string; stderr: string; code: number }>((resolve, reject) => {
    let [stdout, stderr] = ['', '']
    let [outb, errb] = ['', '']
    let resolved = false

    const collect = (x: string, all: string[] = []): [string, string[]] => {
      const [_, n, rest] = /(.*?)\n(.*)/ms.exec(x) || []
      if (typeof n === 'undefined') return [x, all]
      return collect(rest, [...all, n])
    }

    const lines = (buff: string, outb: string) => (x: Buffer | string) => {
      const txt = typeof x === 'string' ? x : x.toString('utf-8')
      outb += txt
      buff += txt
      const [rest, lines] = collect(buff)
      buff = rest
      return lines.forEach((x) => process.stdout.write(`${prepend}${x}\n`))
    }

    const onClose = () => {
      const code = child.exitCode
      if (!code || resolved) return
      resolved = true
      if (code > 0) return reject({ stderr, stdout, code })
      return resolve({ stderr, stdout, code })
    }

    child.stdout?.on('data', lines(outb, stdout))
    child.stdout?.on('close', onClose)
    child.stderr?.on('data', lines(errb, stderr))
    child.stderr?.on('close', onClose)
  })
