import { Router, useNavigate, useSearchParams } from "@solidjs/router";
import { For, createEffect, createResource } from "solid-js";

import { CommandModal, ModalButton } from "./components/shell/modal";
import { Gallery } from "./components/gallery";
import { useDir } from "./components/hooks";
import { File } from "./components/filed";
import { trpc } from "./components/data";
import { Cwd } from "./components";

export const App = () => (
  <Router>
    <CommandModal />
    <Routes />
  </Router>
);

export const Routes = () => {
  const [params, setparams] = useSearchParams<{ filter: string }>();
  const dir = useDir();

  const nav = useNavigate();
  const [files, fq] = createResource(dir(), () =>
    trpc.fs.readdir.query({ dir: dir() })
  );

  createEffect(() => fq.refetch({ dir: dir() }));

  const filtered = () =>
    (files() || []).filter((x) => new RegExp(params.filter || "").test(x));

  return (
    <div class="grid [grid-template:3rem_1fr_/_16rem_1fr] w-full h-full min-h-0 min-w-0">
      <div class="col-span-2 row-start-1 px-4 py-2 border-b flex items-center gap-3">
        <h4 class="">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-red-500">
            Video AI
          </span>{" "}
          for you...
        </h4>
        <input
          class="h-full py-2 px-2 focus:bg-black/5 focus:outline-none w-full flex-1"
          value={dir()}
          onInput={(e) => nav(e.currentTarget.value)}
          placeholder="/user/content..."
        />
        <Cwd />
        <ModalButton />
      </div>
      <div class="row-start-2 border-r overflow-y-auto pb-12">
        <input
          class="py-2 px-2 focus:bg-black/5 bg-white border-b focus:outline-none w-full flex-1 sticky top-0"
          value={params.filter || ""}
          onInput={(e) => setparams({ filter: e.currentTarget.value })}
          placeholder=""
        />
        <ul class="space-y-2 font-medium p-2">
          <File name={() => ".."} dir={dir} />
          <For each={filtered()}>
            {(file) => <File name={() => file} dir={dir} />}
          </For>
        </ul>
      </div>
      <div class="row-start-2 p-3">
        <Gallery files={filtered} />
      </div>
    </div>
  );
};
