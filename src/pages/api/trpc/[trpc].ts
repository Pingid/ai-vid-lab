import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { APIRoute } from "astro";

import { createContext } from "../../../server/context";
import { appRouter } from "../../../server/router";

export const all: APIRoute = async (opts) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: opts.request,
    router: appRouter,
    createContext,
  });
};
