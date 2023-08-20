import type { Description } from '@sonata-api/types'
import { registerStore } from '@waltz-ui/state-management'
import { left, right, isLeft, unwrapEither } from '@sonata-api/common'
import { reactive, computed } from 'vue'
import { useCollectionStore, type CollectionStore } from '../state/collection'
import { useMetaStore } from '.'

type User = {
  _id: string
  full_name: string
  roles: Array<string>
}

type Credentials = {
  email: string
  password: string
}

export const useUserStore = registerStore(() => {
  const initialState = reactive({
    token: '',
    currentUser: {} as Partial<User> & {
      pinged?: boolean
    },
    credentials: {
      email: '',
      password: ''
    },
    description: {} as Description & {
      properties: {
        roles: {
          items: {
            enum: Array<string>
          }
        }
      }
    }
  })

  const $currentUser = computed(() => {
    if( !initialState.currentUser._id ) {
      initialState.token = localStorage.getItem('auth:token')!
      setCurrentUser(JSON.parse(localStorage.getItem('auth:currentUser')||'{}'))
    }

    return initialState.currentUser
  })

  function setCurrentUser(user: User | {}) {
    for( const key in initialState.currentUser ) {
      delete initialState.currentUser[key as keyof typeof initialState.currentUser]
    }
    Object.assign(initialState.currentUser, user)
    localStorage.setItem('auth:currentUser', JSON.stringify(initialState.currentUser))
  }

  function signout() {
    localStorage.removeItem('auth:token')
    localStorage.removeItem('auth:currentUser')
    setCurrentUser({})
  }

  return useCollectionStore<User>()({
    $id: 'user',
    state: initialState,
    getters: (state) => ({
      $currentUser,
      properties: computed(() => {
        const metaStore = useMetaStore()
        const properties = state.description.properties!
        if( !properties ) {
          return {}
        }

        properties.roles.items.enum = Object.keys(metaStore.roles)
        return properties
      }),
      signedIn: computed(() => !!$currentUser.value.roles?.length)
    }),
    actions: (state) => ({
      setCurrentUser,
      signout,

      async authenticate(this: CollectionStore, payload: Credentials | { revalidate: true }) {
        const metaStore = useMetaStore()

        try {
          const resultEither = await this.$functions.authenticate(payload)
          if( isLeft(resultEither) ) {
            const error = unwrapEither(resultEither)
            metaStore.$actions.spawnModal({
              title: 'Erro!',
              body: error as string
            })

            return left(error)
          }

          const {
            user,
            token: _token

          } = unwrapEither(resultEither) as any

          state.credentials = {
            email: '',
            password: ''
          }

          const {
            type: _tokenType,
            token
          } = _token

          setCurrentUser(user)
          localStorage.setItem('auth:token', token)

          await metaStore.$actions.describe({
            roles: true
          })

          return right('ok')

        } catch( err ) {
          signout()
          console.trace(err)

          return left(err)
        }
      },
    }),
  })

})
