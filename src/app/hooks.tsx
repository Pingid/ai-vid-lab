import { useLocation } from "@solidjs/router";
import { createStore } from "solid-js/store";
import { createMemo } from "solid-js";

export const useDir = () => {
  const loc = useLocation();
  return createMemo(() => {
    if (!loc.pathname) console.log("!ERRORR");
    return loc.pathname;
  });
};

export const useMutation = <T extends any, R extends any>(
  cb: (input: T) => Promise<R>
) => {
  const [store, set] = createStore({
    loading: false,
    error: undefined as any,
    data: undefined as R | undefined,
    mutate: async (data: T) => {
      set({ loading: true });
      return cb(data)
        .then((data) => {
          set({ data, loading: false });
          return data;
        })
        .catch((error) => {
          set({ error, loading: false });
          return Promise.reject(error);
        });
    },
  });
  return store;
};
