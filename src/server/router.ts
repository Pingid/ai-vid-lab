import { procedure, router } from "./context";
import { exec } from "node:child_process";
import fs from "node:fs";
import z from "zod";
import { child } from "./util";

const ExecResult = z.object({
  stdout: z.string(),
  stderr: z.string(),
  code: z.number(),
});

export const appRouter = router({
  fs: router({
    cwd: procedure.output(z.string()).query(async ({ ctx }) => process.cwd()),
    readdir: procedure
      .input(z.object({ dir: z.string() }))
      .output(z.array(z.string()))
      .query(({ input }) => fs.promises.readdir(input.dir, {})),
    stat: procedure
      .input(z.object({ file: z.string() }))
      .output(z.object({ directory: z.boolean(), size: z.number() }))
      .query(({ input }) =>
        fs.promises
          .stat(input.file)
          .then((x) => ({ ...x, directory: x.isDirectory() }))
      ),
  }),
  exec: procedure
    .input(z.string())
    .output(ExecResult)
    .mutation(async (x) => {
      const result = await new Promise<any>((resolve, reject) => {
        const child: any = exec(x.input, (r, stdout, stderr) =>
          resolve({ stdout, stderr, code: child.exitCode })
        );
      });
      return result;
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
