<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from '@waltz-ui/web'
import { useStore } from '@waltz-ui/state-management'
import WForm from '../../components/form/w-form/w-form.vue'
import WIcon from '../../components/w-icon/w-icon.vue'
import WButton from '../../components/w-button/w-button.vue'
import WCheckbox from '../../components/form/w-checkbox/w-checkbox.vue'
import WPasswordForm from '../../components/dashboard/w-password-form/w-password-form.vue'

const router = await useRouter()
const userStore = useStore('user')
const metaStore = useStore('meta')

if( !metaStore.descriptions.user ) {
  await metaStore.$actions.describe({
    collections: ['user'],
    roles: true
  })
}

const tosAccepted = ref(false)
const password = ref({
  password: '',
  confirmation: ''
})

const insert = async () => {
  userStore.item.password = password.value.password
  const user = await userStore.$actions.insert().catch(async (e) => {
    throw e
  })

  await metaStore.$actions.spawnModal({
    title: 'Conta registrada',
    body: 'Blabla'
  })

  // router.push({ name: 'user-signin' })
}
</script>

<template>
  <div>
    <h1>Criar conta</h1>
    <w-icon
      v-clickable
      icon="arrow-left"
      @click="router.push({ name: '/user/signin' })"
    >
      Efetuar login
    </w-icon>
  </div>

  <w-form
    v-model="userStore.item"
    v-bind="{
      collection: 'user',
      form: userStore.$actions.useProperties([
        'full_name',
        'email',
        'phone'
      ])
    }"
  >
    <template #after>
      <w-password-form v-model="password" v-slot="{ passwordError }">
        <div style="
          display: flex;
          flex-direction: column;
          align-items: start;
          gap: 2rem
        ">
          <w-checkbox
            v-model="tosAccepted"
            :property="{
              type: 'boolean',
              s$element: 'checkbox'
            }"
          >
            Declaro que li e aceito os termos de uso
          </w-checkbox>

        </div>

        <w-button
          :disabled="!!passwordError || !tosAccepted"
          @click="insert"
        >
          Criar conta
        </w-button>
      </w-password-form>
    </template>
  </w-form>


</template>
