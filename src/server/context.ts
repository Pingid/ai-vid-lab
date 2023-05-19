import type { PrismaClient } from "@prisma/client";
import { initTRPC } from "@trpc/server";

interface Context {
  db: PrismaClient;
  user: { name: string; id: number };
}
export const t = initTRPC.context<{}>().create();

export const router = t.router;
export const procedure = t.procedure;

export const createContext = async () => {
  // const db = new PrismaClient();

  // await db.user.upsert({
  //   where: { id: 1 },
  //   create: { name: "Test" },
  //   update: {},
  // });

  return {
    // db: new PrismaClient(),
    user: { name: "Test", id: 1 },
  };
};
