import type { ChildProcess } from "node:child_process";

export const resolve = (
  child: ChildProcess,
  opts?: { onStdout?: (x: string) => void; onStderr?: (x: string) => void }
) =>
  new Promise<{ stdout: string; stderr: string; code: number }>(
    (resolve, reject) => {
      let [stdout_buffer, stderr_buffer] = ["", ""];
      let [stdout, stderr] = ["", ""];
      let resolved = false;

      const collect = (x: string, all: string[] = []): [string, string[]] => {
        const [_, n, rest] = /(.*?)\n(.*)/ms.exec(x) || [];
        if (typeof n === "undefined") return [x, all];
        return collect(rest, [...all, n]);
      };

      const extractLines =
        (_buff: string, _outb: string, onLine?: (x: string) => void) =>
        (x: Buffer | string) => {
          const txt = typeof x === "string" ? x : x.toString("utf-8");
          _outb += txt;
          if (!onLine) return;
          _buff += txt;
          const [rest, lines] = collect(_buff);
          _buff = rest;
          return lines.forEach((x) => onLine(`${x}\n`));
        };

      const onClose = () => {
        const code = child.exitCode;
        if (!code || resolved) return;
        resolved = true;
        if (code > 0) return reject({ stderr, stdout, code });
        return resolve({ stderr, stdout, code });
      };

      child.stdout?.on(
        "data",
        extractLines(stdout_buffer, stdout, opts?.onStdout)
      );
      child.stdout?.on("close", onClose);
      child.stderr?.on(
        "data",
        extractLines(stderr_buffer, stderr, opts?.onStderr)
      );
      child.stderr?.on("close", onClose);
      child.on("error", onClose);
      child.on("exit", onClose);
    }
  );
