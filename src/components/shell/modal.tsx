import { Show, createEffect, createSignal, onCleanup } from "solid-js";

import { Xterm } from "./xterm";

const [modal, setmodal] = createSignal(false);

export const CommandModal = () => {
  createEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "k") return "";
      if (!e.metaKey || !e.shiftKey || e.key !== " ") return;
      setmodal((x) => !x);
    };
    window.addEventListener("keydown", handler);
    onCleanup(() => window.removeEventListener("keydown", handler));
  });

  return (
    <Show when={modal()}>
      <div
        class="fixed inset-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto h-[calc(100%-1rem)] max-h-full flex justify-center items-center bg-black/5"
        onclick={() => setmodal(false)}
      >
        <div
          class="bg-black p-3 w-full max-w-4xl text-white"
          onclick={(e) => e.stopPropagation()}
        >
          <Xterm ws="ws://localhost:8002/shell" />
        </div>
      </div>
    </Show>
  );
};

export const ModalButton = () => {
  return (
    <button
      type="button"
      class="border px-3 hover:bg-black/5 rounded-sm "
      classList={{ "border-red-500 text-red-500": modal() }}
      onclick={() => setmodal((x) => !x)}
    >
      SHELL
    </button>
  );
};
