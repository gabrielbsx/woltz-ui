<script setup lang="ts">
import { useStore } from '@waltz-ui/state-management'
import WBox from '../../w-box/w-box.vue'

type Props = {
  closeHint?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closeHint: true
})

const metaStore = useStore('meta')
</script>

<template>
  <w-box
    float
    v-bind="props"
    @close="metaStore.modal.isVisible = false"
    @overlay-click="metaStore.modal.isVisible = false"
  >
    <slot name="body" v-if="$slots.body"></slot>
    <slot v-else></slot>
    <template #footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </template>
  </w-box>
</template>
