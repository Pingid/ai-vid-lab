import { JSX, Show, createResource } from "solid-js";
import { A } from "@solidjs/router";

import { IconDocument, IconFolder } from "./icons";
import { trpc } from "./data";

export const File = (p: { dir: () => string; name: () => string }) => {
  const file = () => [p.dir(), p.name()].join("/").replace(/\/{1,}/gim, "/");
  const [stat] = createResource(() => trpc.fs.stat.query({ file: file() }));

  return (
    <>
      <Show when={!stat.error && stat()?.directory}>
        <A
          href={file()}
          class="flex items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <IconFolder class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
          <span class="ml-1 whitespace-nowrap">{p.name()}</span>
        </A>
      </Show>
      <Show when={!stat.error && !stat()?.directory}>
        <button
          class="flex items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => {}}
        >
          <IconDocument class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
          <span class="ml-1 whitespace-nowrap">{p.name()}</span>
        </button>
      </Show>
    </>
  );
};
