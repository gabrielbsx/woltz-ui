<script setup lang="ts">
import type { FiltersPreset } from '@sonata-api/types'
import { computed, watch, type ComputedRef } from 'vue'
import { useRouter } from '@waltz-ui/web'
import { useParentStore } from '@waltz-ui/state-management'
import WTabs from '../../w-tabs/w-tabs.vue'
import WIcon from '../../w-icon/w-icon.vue'

type Props = {
  collection?: string
}

const props = defineProps<Props>()
const router = await useRouter()
const route = router.currentRoute

const store = computed(() => {
  try {
    const collection = props.collection
      ? props.collection
      : (route.value.meta?.collection || route.value.params?.collection) as string

    return useParentStore(collection)
  } catch( e ) {
    return null
  }
})

const togglePreset = (presetName: string, preset?: FiltersPreset<any>) => {
  if( !store.value ) {
    return
  }

  return (({ value: store }: ComputedRef<ReturnType<typeof useParentStore>|null>) => {
    if( !store ) {
      return
    }

    store.filtersPreset = preset?.filters || {}
    store.preferredTableProperties = preset?.table || []
    store.pagination.offset = 0
  })(store)
}

watch(route, (currRoute, prevRoute) => {
  if( !store.value || prevRoute ) {
    return
  }

  const currPreset = currRoute.query.section as string

  return (({ value: store }) => {
    if( !store ) {
      return
    }

    if( store.description.filtersPresets ) {
      if( currPreset ) {
        togglePreset(currPreset, store.description.filtersPresets[currPreset])
        return
      }

      togglePreset('')
    }
  })(store)
}, { immediate: true })
</script>

<template>
  <div
    v-if="store && Object.keys(store.description.filtersPresets||{}).length > 0"
    class="topbar"
  >
    <w-tabs
      v-if="store?.description.filtersPresets"
      query="section"
    >
      <template #all>
        <div @click="togglePreset('')">
          {{ $t('all') }}
        </div>
      </template>
      <template
        v-for="([presetName, preset]) in Object.entries(store.description.filtersPresets)"
        v-slot:[presetName]
      >
        <div @click="togglePreset(presetName, preset)">
          <w-icon
            small
            v-if="preset.icon"
            :icon="preset.icon"
          >
            {{ preset.name || $tc(presetName, 2) }}
          </w-icon>
          <span v-else>{{ preset.name || $tc(presetName, 2) }}</span>
          <span v-if="preset.badgeFunction">
            <!-- ({{ -->
            <!--   store.customGetter[preset.badgeFunction](presetName, { -->
            <!--     filters: preset.filters -->
            <!--   }) -->
            <!-- }}) -->
          </span>
        </div>
      </template>
    </w-tabs>
  </div>
</template>

<style scoped src="./w-crud-topbar.scss"></style>
