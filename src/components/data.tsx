import { createTRPCProxyClient } from '@trpc/client'
import { httpBatchLink } from '@trpc/client/links/httpBatchLink'

import type { AppRouter } from '../../server/trpc'

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: '/trpc', maxURLLength: 2083 })],
})
