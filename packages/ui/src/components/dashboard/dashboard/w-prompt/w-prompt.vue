<script setup lang="ts">
import { useStore } from '@waltz-ui/state-management'
import WModal from '../w-modal/w-modal.vue'
import WButton from '../../w-button/w-button.vue'


type Props = {
  title?: string
  actions: Array<any>
}

const props = defineProps<Props>()
const metaStore = useStore('meta')

const onClick = (answer: any) => {
  metaStore.$actions.fulfillPrompt(answer)
}
</script>

<template>
  <w-modal :close-hint="false">
    <slot v-if="$slots.body" name="body"></slot>
    <slot v-else></slot>

    <template #title v-if="title">
      {{ title }}
    </template>

    <template #footer>
      <w-button
        v-for="(action, index) in actions"
        v-bind="action"
        :key="`action-${index}`"

        @click="onClick(action)"
      >
        {{ action.title }}
      </w-button>
    </template>
  </w-modal>
</template>
