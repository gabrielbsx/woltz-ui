<script setup lang="ts">
type Props = {
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', event: any): void
}>()

const onClick = (event: any) => {
  event.stopPropagation()
  event.preventDefault()

  if( !props.disabled ) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="`
      barebutton
      barebutton--${disabled ? 'disabled' : 'enabled'}
    `"
    @click="onClick"
  >
    <slot></slot>
  </button>
</template>

<style scoped src="./w-bare-button.scss"></style>
