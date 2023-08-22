<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import WIcon from '../w-icon/w-icon.vue'

// #region props
type Props = {
  closeHint?: boolean
  modelValue?: any
  title?: string
  float?: boolean
  fixedRight?: boolean
  floating?: boolean
  overlay?: boolean
  invisibleOverlay?: boolean
  collapsed?: boolean
  collapsible?: boolean
  fullWidth?: boolean
  fill?: boolean
  transparent?: boolean
  transparentMobile?: boolean
  outerHeader?: boolean
}
// #endregion props

const props = withDefaults(defineProps<Props>(), {
  collapsible: false,
  closeHint: false,
  modelValue: true,
})

const emit = defineEmits<{
  (e:
    'update:modelValue'
    | 'update:collapsed'
    | 'update:closeHint',
    value: boolean
  ): void
  (e: 'overlayClick'): void
  (e: 'close'): void
}>()

const isFloating = computed(() => props.floating || props.float)
const isCollapsed = ref(props.collapsed)

const body = ref<Element & { offsetHeight: number }>()

const reachedEnd = ref(true)

const updateScroll = () => {
  const { value: bodyElem } = body
  reachedEnd.value = bodyElem
    ? bodyElem.scrollTop + bodyElem.offsetHeight! >= bodyElem.scrollHeight
    : true
}

watch(() => body.value, (bodyElem) => {
  if( bodyElem ) {
    const ob = new ResizeObserver(updateScroll)
    ob.observe(bodyElem)
  }
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const overlayClick = () => {
  emit('overlayClick')
}

const toggleCollapsed = (value: boolean) => {
  emit('update:collapsed', value)
  isCollapsed.value = value
}
</script>

<template>
  <div
    v-if="modelValue"
    v-overlay="{
      condition: overlay || fixedRight || isFloating,
      invisible: invisibleOverlay,
      click: overlayClick
    }"

    :class="`
      box
      ${isFloating && 'box--floating'}
      ${fixedRight && 'box--fixed'}
  `">
    <!-- box content -->
    <div
      data-component="box"
      :class="`
        w-surface
        box__content
        ${!(isFloating || fixedRight) && 'box__content--bordered'}
        ${isFloating && 'box__content--floating'}
        ${fixedRight && 'box__content--fixed-right'}
        ${transparent && 'box__content--transparent'}
        ${transparentMobile && 'box__content--transparent-mobile'}
        ${outerHeader && 'box__content--outer-header'}
      `"
      @click="$event.stopPropagation()"
    >
      <!-- box head -->
      <div
        v-if="$slots.header || title"
        :class="`
          box__header
          ${isCollapsed && 'box__header--collapsed'}
          ${outerHeader && 'box__header--outer'}
      `">
        <div class="box__header-left">
          <slot v-if="$slots.header" name="header"></slot>
          <div v-else-if="title">{{ title }}</div>
          <div
            v-if="$slots.extra"
            style="margin-left: auto"
          >
            <slot name="extra"></slot>
          </div>
        </div>

        <w-icon
          v-clickable
          v-if="collapsible"
          reactive
          :icon="!isCollapsed ? 'minus' : 'plus'"
          @click="toggleCollapsed(!isCollapsed)"
        />
        <w-icon
          v-clickable
          v-else-if="closeHint"
          reactive
          icon="multiply"
          @click="close"
        />
      </div>

      <!-- box body -->
      <div
        v-if="!isCollapsed"
        :class="`
          box__body
          ${fill || 'box__body--padded'}
      `"
        ref="body"
        @scroll="updateScroll"
      >
        <slot v-if="$slots.default"></slot>
        <slot v-else name="body"></slot>
      </div>

      <!-- box footer -->
      <div
        v-if="$slots.footer"
        :class="`
          box__footer
          ${reachedEnd || 'box__footer--shadowed'}
        `"
      >
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped src="./w-box.scss"></style>
