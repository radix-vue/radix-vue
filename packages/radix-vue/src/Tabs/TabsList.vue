<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'

export interface TabsListProps extends PrimitiveProps {
  loop?: boolean
}
</script>

<script setup lang="ts">
import { injectTabsRootContext } from './TabsRoot.vue'
import { Primitive } from '@/Primitive'
import { RovingFocusGroup } from '@/RovingFocus'

withDefaults(defineProps<TabsListProps>(), {
  loop: true,
})

const context = injectTabsRootContext()
</script>

<template>
  <RovingFocusGroup as-child :orientation="context.orientation.value" :dir="context.dir.value" :loop="loop">
    <Primitive
      :ref=" (vnode) => {
        if (vnode && '$el' in vnode)
          context.tabsList.value = vnode.$el
      }"
      role="tablist"
      :as-child="asChild"
      :as="as"
      :aria-orientation="context.orientation.value"
    >
      <slot />
    </Primitive>
  </RovingFocusGroup>
</template>
