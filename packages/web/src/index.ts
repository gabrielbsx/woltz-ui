export * from './app'
export * from './bootstrap'
export * from './composables'
export * from './constants'
export * from './options'
export * from './router'
export * from './state'
export * from './http'

import { useMetaStore, useUserStore } from './stores'

STORES.meta = useMetaStore
STORES.user = useUserStore

export {
  useMetaStore,
  useUserStore
}

window.userStorage = localStorage
