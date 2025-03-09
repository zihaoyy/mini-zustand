export interface StoreApi<T> {
  setState: (
    partial: T | Partial<T> | { _(state: T): T | Partial<T> | void } ["_"],
    replace?: boolean | undefined
  ) => void
  getState: () => T
  subscribe: (listener: (state: T, prevState: T) => void) => () => void
  destroy: () => void
}

export type StateCreator<T> = (
  setState: StoreApi<T>['setState'],
  getState: StoreApi<T>['getState'],
  store: StoreApi<T>
) => T

type CreateStore = {
  <T>(createState: StateCreator<T>): StoreApi<T>;
  <T>(): (createState: StateCreator<T>) => StoreApi<T>;
};

export const createStore = ((createState) =>
  createState ? createStoreImpl(createState) : createStoreImpl) as CreateStore;

type CreateStoreImpl = <T>(createImpl: StateCreator<T>) => StoreApi<T>;
const createStoreImpl: CreateStoreImpl = (createState) => {
  type TState = ReturnType<typeof createState>
  type TListener = (state: TState, prevState: TState) => void

  let state: TState
  const listeners: Set<TListener> = new Set()

  const setState: StoreApi<TState>['setState'] = (partial, replace) => {
    const nextState = typeof partial === 'function' ? (partial as (state: TState) => TState)(state) : partial

    if (!Object.is(nextState, state)) {
      const prevState = state
      state = replace ?? typeof nextState !== 'object' ? (nextState as TState) : Object.assign({}, state, nextState)

      listeners.forEach((listener) => listener(state, prevState))
    }
  }

  const getState: StoreApi<TState>['getState'] = () => state

  const subscribe: StoreApi<TState>['subscribe'] = (listener: TListener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const destroy: StoreApi<TState>['destroy'] = () => listeners.clear()


  const api = {
    getState,
    setState,
    subscribe,
    destroy,
  }

  state = createState(setState, getState, api)

  return api
}