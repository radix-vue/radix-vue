<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'
import { useForwardExpose } from '@/shared'
import type { ModelValue } from './TabsRoot.vue'

export interface TabsContentProps extends PrimitiveProps {
  /** A unique value that associates the content with a trigger. */
  value: ModelValue
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with Vue animation libraries.
   */
  forceMount?: boolean
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { injectTabsRootContext } from './TabsRoot.vue'
import { Primitive } from '@/Primitive'
import { makeContentId, makeTriggerId } from './utils'
import { Presence } from '@/Presence'

const props = defineProps<TabsContentProps>()

const { forwardRef } = useForwardExpose()
const rootContext = injectTabsRootContext()
const triggerId = computed(() => makeTriggerId(rootContext.baseId, props.value))
const contentId = computed(() => makeContentId(rootContext.baseId, props.value))

const isSelected = computed(() => props.value === rootContext.modelValue.value)

const isMountAnimationPreventedRef = ref(isSelected.value)

onMounted(() => {
  requestAnimationFrame(() => {
    isMountAnimationPreventedRef.value = false
  })
})
</script>

<template>
  <Presence
    v-slot="{ present }"
    :present="isSelected"
    force-mount
  >
    <Primitive
      :id="contentId"
      :ref="forwardRef"
      :as-child="asChild"
      :as="as"
      role="tabpanel"
      :data-state="isSelected ? 'active' : 'inactive'"
      :data-orientation="rootContext.orientation.value"
      :aria-labelledby="triggerId"
      :hidden="!present.value"
      tabindex="0"
      :style="{
        animationDuration: isMountAnimationPreventedRef ? '0s' : undefined,
      }"
    >
      <slot v-if="forceMount || isSelected" />
    </Primitive>
  </Presence>
</template>
