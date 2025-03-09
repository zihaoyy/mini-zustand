import {createStore, StateCreator, StoreApi} from "./vanilla.ts";

import useSyncExternalStoreExports from "use-sync-external-store/shim/with-selector";

const {useSyncExternalStoreWithSelector} = useSyncExternalStoreExports;

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getState" | "subscribe">;

type WithReact<S extends ReadonlyStoreApi<unknown>> = S & {
  getServerState?: () => ExtractState<S>;
};

export type UseBoundStore<S extends WithReact<ReadonlyStoreApi<unknown>>> = {
  (): ExtractState<S>;
  <U>(
    selector: (state: ExtractState<S>) => U,
    equals?: (a: U, b: U) => boolean
  ): U;
} & S;

type Create = {
  <T>(createState: StateCreator<T>): UseBoundStore<StoreApi<T>>;
  <T>(): (createState: StateCreator<T>) => UseBoundStore<StoreApi<T>>;
};

export const create = function <T>(createState: StateCreator<T>) {
  return createState ? createImpl(createState) : createImpl;
} as Create;

function createImpl<T>(createState: StateCreator<T>) {
  const api =
    typeof createState === "function" ? createStore(createState) : createState;

  return (selector?: never, equalityFn?: never) =>
    useStore(api, selector, equalityFn);
}

export function useStore<TState, StateSlice>(
  api: WithReact<StoreApi<TState>>,
  selector: (state: TState) => StateSlice = api.getState as never,
  equalityFn?: (a: StateSlice, b: StateSlice) => boolean
) {
  return useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getState,
    selector,
    equalityFn
  );
}