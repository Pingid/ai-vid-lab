import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import z from 'zod'

import { procedure, router } from './context'

export const appRouter = router({
  fs: router({
    cwd: procedure.output(z.string()).query(() => process.cwd()),
    readdir: procedure
      .input(z.object({ dir: z.string() }))
      .output(z.array(z.string()))
      .query(async ({ input }) => {
        console.log('readdir', input.dir)
        const stats = await stat(input.dir)
        if (!stats.isDir) return []
        return fs.promises.readdir(input.dir, {})
      }),
    stat: procedure
      .input(z.object({ file: z.string() }))
      .output(z.object({ directory: z.boolean() }))
      .query(({ input }) => {
        console.log('stat', input)
        return Promise.resolve(stat(input.file)).then((x) => ({ ...x, directory: x.isDir }))
      }),
  }),
})

const ls = (x: string) => {
  const files = spawnSync('sh', ['-c', `ls`], { cwd: x })
  return files.stdout.toString('utf-8').trim().split('\n')
}
const stat = (x: string) => {
  const isFile = spawnSync('sh', ['-c', `[[ -f ${x} ]] && echo "true"`])
  const isDir = spawnSync('sh', ['-c', `[[ -d ${x} ]] && echo "true"`])
  return {
    isFile: isFile.stdout.toString('utf-8').trim() === 'true',
    isDir: isDir.stdout.toString('utf-8').trim() === 'true',
  }
}

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
