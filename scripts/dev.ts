import { exec } from 'node:child_process'
import { join } from './util'

join({ client: exec('pnpm run dev:client'), server: exec('pnpm run dev:server') })
