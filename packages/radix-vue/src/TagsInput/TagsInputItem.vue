<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'
import { createContext, useId } from '@/shared'
import { type Ref, computed, toRef } from 'vue'
import { injectTagsInputRootContext } from './TagsInputRoot.vue'

export interface TagsInputItemProps extends PrimitiveProps {
  value: string
  disabled?: boolean
}

export interface TagsInputItemContext {
  value: Ref<string>
  isSelected: Ref<boolean>
  disabled?: Ref<boolean>
  textId: string
}

export const [injectTagsInputItemContext, provideTagsInputItemContext]
  = createContext<TagsInputItemContext>('TagsInputItem')
</script>

<script setup lang="ts">
import { Primitive, usePrimitiveElement } from '@/Primitive'
import { CollectionItem } from '@/Collection'

const props = defineProps<TagsInputItemProps>()

const context = injectTagsInputRootContext()
const { primitiveElement, currentElement } = usePrimitiveElement()
const isSelected = computed(() => context.selectedElement.value === currentElement.value)

const textId = useId()
const disabled = computed(() => props.disabled || context.disabled.value)

provideTagsInputItemContext({
  value: toRef(props, 'value'),
  isSelected,
  disabled,
  textId,
})
</script>

<template>
  <CollectionItem>
    <Primitive
      ref="primitiveElement"
      :as="as"
      :as-child="asChild"
      :aria-labelledby="textId"
      :aria-current="isSelected"
      :data-disabled="disabled ? '' : undefined"
      :data-state="isSelected ? 'active' : 'inactive'"
    >
      <slot />
    </Primitive>
  </CollectionItem>
</template>
