import { join } from "./util";
import { exec } from "node:child_process";

join({
  server: exec("pnpm run dev"),
  tunnel: exec("ngrok http --log stdout 3000"),
});
