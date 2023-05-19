import type { APIRoute } from "astro";
import { execSync } from "node:child_process";
import fs from "node:fs";

export const get: APIRoute = async (props) => {
  const file = props.url.searchParams.get("file");
  if (!file || !fs.existsSync(file)) return new Response("", { status: 400 });
  get_mime_type(file);
  const stat = await fs.promises.stat(file);
  if (stat.isDirectory()) return new Response("", { status: 400 });
  const mime = get_mime_type(file);
  const stream = await fs.promises.readFile(file);
  if (!mime || !/image/.test(mime)) return new Response("", { status: 400 });
  return new Response(stream, {
    headers: { "Content-Type": mime || "", "Content-Length": `${stat.size}` },
  });
};

const get_mime_type = (pth: string) => {
  try {
    const result = execSync(`file --mime-type -b ${pth}`);
    return result.toString().trim();
  } catch (e) {
    return null;
  }
};
