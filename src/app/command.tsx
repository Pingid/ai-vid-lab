import { For, createEffect, createSignal, onCleanup } from "solid-js";
import { Modal } from "flowbite";

import { useMutation } from "./hooks";
import { trpc } from "./data";

const modal_name = "command-modal";
export const ModalButton = () => (
  <button
    data-modal-target={modal_name}
    data-modal-toggle={modal_name}
    data-modal-show={modal_name}
    type="button"
    class="border px-3 hover:bg-black/5 rounded-sm"
  >
    CMD
  </button>
);

type LogLine = { value: string; type: "stdout" | "stderr" };

export const CommandModal = () => {
  const [stdout, setstdout] = createSignal<LogLine[]>([]);
  const [cmd, setcmd] = createSignal("");

  const exec = useMutation(trpc.exec.mutate);

  let modal_elem: HTMLDivElement | null = null;
  let input_elem: HTMLInputElement | null = null;
  let output_elem: HTMLDivElement | null = null;

  createEffect(() => {
    let modal = new Modal(modal_elem);
    input_elem?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "k") setstdout([]);
      if (!e.metaKey || !e.shiftKey || e.key !== " ") return;
      modal.toggle();
      input_elem?.focus();
    };
    window.addEventListener("keydown", handler);
    onCleanup(() => window.removeEventListener("keydown", handler));
  });

  createEffect(() => {
    stdout();
    if (!output_elem) return;
    input_elem?.focus();
    output_elem.scrollTop = output_elem.scrollHeight;
  });

  return (
    <div
      id={modal_name}
      ref={(e) => (modal_elem = e)}
      tabindex="-1"
      aria-hidden="true"
      class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
    >
      <div class="relative w-full max-w-2xl max-h-full">
        <div class="relative bg-bg rounded-md p-3">
          <div
            class="max-h-[20rem] overflow-y-auto"
            ref={(e) => (output_elem = e)}
          >
            <For each={stdout()}>
              {(x) => (
                <p
                  class={"text-sm text-er"}
                  classList={{
                    "text-fg2": x.type === "stdout",
                    "text-red-500": x.type === "stderr",
                  }}
                >
                  {x.value}
                </p>
              )}
            </For>
          </div>
          <form
            class="flex"
            onSubmit={(e) => {
              e.preventDefault();
              console.log(e);
              exec
                .mutate(cmd())
                .then((x) => {
                  let out: LogLine[] = [
                    { value: `$ ${cmd()}\n`, type: "stdout" },
                  ];

                  if (x.stderr) {
                    out.push(
                      ...x.stderr
                        .split("\n")
                        .map((value) => ({ value, type: "stderr" as const }))
                    );
                  }
                  if (x.stdout) {
                    out.push(
                      ...x.stdout
                        .split("\n")
                        .map((value) => ({ value, type: "stdout" as const }))
                    );
                  }
                  if (x.code > 0) {
                    out.push({
                      value: `exited (${x.code})`,
                      type: "stderr",
                    });
                  }
                  setstdout((y) => [...y, ...out]);
                  setcmd("");
                })
                .catch(console.error);
            }}
          >
            <span class="pr-2 text-sm">$</span>
            <input
              class="w-full focus:outline-none text-sm"
              ref={(e) => (input_elem = e)}
              value={cmd()}
              disabled={exec.loading}
              onInput={(e) => setcmd(e.target.value)}
            />
          </form>
        </div>
      </div>
    </div>
  );
};
