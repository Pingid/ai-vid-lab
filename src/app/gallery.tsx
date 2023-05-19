import { JSX, Show, createEffect, createSignal, onCleanup } from "solid-js";
import { useDir } from "./hooks";
import { IconPlay, IconStop } from "./icons";

export const Gallery = (p: { files: () => string[] }) => {
  const controls = useControls(() => p.files().length - 2);
  const dir = useDir();

  const file = () => `${dir()}/${p.files()[controls.frame()]}`;

  return (
    <div>
      <div class="flex flex-col border-2 relative">
        {/* <input
          value={file()}
          disabled
          class="w-full text-xs bg-transparent my-1 absolute -top-5"
        /> */}
        <div class="w-full ">
          <img src={`/api/image?file=${file()}`} class="w-full" />
        </div>
        <div class="flex items-center gap-3 bg-fg px-2 text-bg">
          <input class="w-full" {...controls.slider()} />
          <div class="whitespace-nowrap">
            {controls.frame() + 1} / {p.files().length - 1}
          </div>
          <div class="flex items-center">
            <p class="whitespace-nowrap">FPS:</p>
            <input
              type="number"
              class="bg-transparent p-1 focus:outline-none border-none w-12"
              value={controls.fps()}
              onInput={(e) => controls.setfps(parseInt(e.target.value))}
            />
            <button class="w-5 h-5" onClick={controls.toggle}>
              <Show when={controls.playing()}>
                <IconStop></IconStop>
              </Show>
              <Show when={!controls.playing()}>
                <IconPlay></IconPlay>
              </Show>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const useControls = (max: () => number) => {
  const [current, setcurrent] = createSignal(0);
  const [fps, setfps] = createSignal(15);
  const [playing, setplaying] = createSignal(false);

  const frame = () => current();

  const slider = (): JSX.InputHTMLAttributes<HTMLInputElement> => ({
    type: "range",
    value: frame(),
    onInput: (e) => setcurrent(parseInt(e.target.value)),
    min: 0,
    max: max(),
  });

  const toggle = () => {
    if (current() >= max()) setcurrent(0);
    setplaying((x) => !x);
  };

  let interval: any;
  onCleanup(() => clearInterval(interval));
  createEffect(() => {
    clearInterval(interval);
    let _fps = fps();
    if (!playing()) return;
    interval = setInterval(() => {
      let next = current() + 1;
      if (next <= max()) setcurrent(next);
      else {
        clearInterval(interval);
        setplaying(false);
      }
    }, Math.floor(1000 / _fps));
  });

  return { frame, slider, toggle, playing, fps, setfps };
};
