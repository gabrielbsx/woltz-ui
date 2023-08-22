# w-box

Standardized floating, fixed, and inline panels.

## Props

## Slots

- header: panel header, replaces `title` prop
- footer: fixed panel footer

## Example

```vue
<script setup lang="ts">
const panelVisible = ref(false)
</script>

<template>
  <w-box
    float
    close-hint
    title="Example"
    v-model="panelVisible"
  >
    This is an example

    <template #footer>
      <w-button>Ok!</w-button>
    </template>
  </w-box>
</template>
```
