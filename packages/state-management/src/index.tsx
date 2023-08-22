import React, { createContext, useContext } from "react";

export type StoreState<
  TContent extends object = Record<string, Exclude<any, Function>>
> = TContent;

export type Store = StoreState & {
  $id: string;
  $actions: Record<string, (...args: any[]) => any>;
  $functions: Record<string, (...args: any[]) => any>;
};

window.STORES ??= {};

const StoreContext = createContext(STORES);

export function useStore(storeId: string) {
  const stores = useContext(StoreContext);
  if (!(storeId in stores)) {
    throw new Error(`tried to invoke unregistered store "${storeId}"`);
  }
  return stores[storeId];
}

export const useParentStore = (fallback?: string) => {
  let parentStoreId = useContext(StoreContext) as unknown as string | null;
  if (!parentStoreId) {
    if (!fallback) {
      throw new Error("no parent store found");
    }
    parentStoreId = fallback;
  }
  return useStore(parentStoreId);
};

export const useStoreState = (storeId: string) => {
  const store = useStore(storeId);
  return store;
};

export const hasStore = (storeId: string) => {
  return storeId in STORES;
};

export const registerStore = <
  const TStoreId extends string,
  TStoreState extends StoreState,
  TStoreGetters extends Record<string, any>,
  TStoreActions extends Record<string, (...args: any[]) => any>,
  Return = TStoreState &
    TStoreGetters & {
      $id: TStoreId;
      $actions: TStoreActions;
      $functions: Record<string, (...args: any[]) => any>;
    }
>(
  fn: () => {
    $id: TStoreId;
    state: TStoreState;
    getters?: TStoreGetters;
    actions?: TStoreActions;
  }
) => {
  const { $id, state, getters, actions } = fn();
  if (hasStore($id)) {
    return () => STORES[$id] as Return;
  }
  const store = state;
  Object.assign(store, {
    $id,
  });
  if (getters) {
    Object.assign(store, getters);
  }
  if (actions) {
    const functions = new Proxy(
      {},
      {
        get: (_target, verb: string) => {
          return (...args: any[]) => actions.custom(verb, ...args);
        },
      }
    );
    const proxiedActions = new Proxy(actions, {
      get: (target, key: string) => {
        if (typeof target[key] !== "function") {
          return target[key];
        }
        return target[key].bind({
          ...actions,
          $functions: functions,
        });
      },
    });
    Object.defineProperty(store, "$actions", {
      value: proxiedActions,
      writable: true,
    });
    Object.defineProperty(store, "$functions", {
      value: functions,
      writable: true,
    });
  }
  STORES[$id] = store as Store;
  return () => store as unknown as Return;
};
