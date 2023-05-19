import { useNavigate } from "@solidjs/router";
import { createResource } from "solid-js";

import { trpc } from "./data";

export const Cwd = () => {
  const nav = useNavigate();
  const [cwd, { refetch }] = createResource(() => trpc.fs.cwd.query(), {
    initialValue: "/",
  });

  return (
    <button
      type="button"
      class="border px-3 hover:bg-black/5 rounded-sm "
      classList={{ "border-red-500 text-red-500": cwd.loading }}
      onclick={() => Promise.resolve(refetch()).then(() => nav(cwd()))}
    >
      DIR
    </button>
  );
};
