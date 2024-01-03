<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'
import { createContext, useArrowNavigation, useFormControl } from '@/shared'
import type { Direction } from '@/shared/types'
import { type Ref, computed, ref, toRef } from 'vue'
import { useConfig } from '@/ConfigProvider'

export interface TagsInputRootProps extends PrimitiveProps {
  modelValue?: Array<string>
  defaultValue?: Array<string>
  addOnPaste?: boolean
  duplicate?: boolean
  disabled?: boolean
  delimiter?: string
  dir?: Direction
  max?: number

  required?: boolean
  name?: string
  id?: string
}

export type TagsInputRootEmits = {
  'update:modelValue': [payload: Array<string>]
  'invalid': [payload: string]
}

export interface TagsInputRootContext {
  modelValue: Ref<Array<string>>
  onAddValue: (payload: string) => boolean
  onRemoveValue: (index: number) => void
  onInputKeydown: (event: KeyboardEvent) => void
  selectedElement: Ref<HTMLElement | undefined>
  isInvalidInput: Ref<boolean>
  addOnPaste: Ref<boolean>
  disabled: Ref<boolean>
  delimiter: Ref<string>
  dir: Ref<Direction>
  max: Ref<number>
  id: Ref<string | undefined> | undefined
}

export const [injectTagsInputRootContext, provideTagsInputRootContext]
  = createContext<TagsInputRootContext>('TagsInputRoot')
</script>

<script setup lang="ts">
import { Primitive, usePrimitiveElement } from '@/Primitive'
import { CollectionSlot, createCollection } from '@/Collection'
import { useFocusWithin, useVModel } from '@vueuse/core'
import { VisuallyHiddenInput } from '@/VisuallyHidden'

const props = withDefaults(defineProps<TagsInputRootProps>(), {
  defaultValue: () => [],
  delimiter: ',',
  max: 0,
})
const emits = defineEmits<TagsInputRootEmits>()

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: true,
  deep: true,
}) as Ref<Array<string>>

const { primitiveElement, currentElement } = usePrimitiveElement()
const { focused } = useFocusWithin(currentElement)
const isFormControl = useFormControl(currentElement)

const { getItems } = createCollection()

const selectedElement = ref<HTMLElement>()
const isInvalidInput = ref(false)

provideTagsInputRootContext({
  modelValue,
  onAddValue: (payload) => {
    if ((modelValue.value.length >= props.max) && !!props.max) {
      emits('invalid', payload)
      return false
    }

    if (props.duplicate) {
      modelValue.value.push(payload)
      return true
    }
    else {
      const exist = modelValue.value.includes(payload)
      if (!exist) {
        modelValue.value.push(payload)
        return true
      }
      else {
        isInvalidInput.value = true
      }
    }
    emits('invalid', payload)
    return false
  },
  onRemoveValue: (index) => {
    if (index !== -1)
      modelValue.value.splice(index, 1)
  },
  onInputKeydown: (event) => {
    const target = event.target as HTMLInputElement
    const collection = getItems().map(i => i.ref).filter(i => i.dataset.disabled !== '')
    if (!collection.length)
      return
    const lastTag = collection.at(-1)
    switch (event.key) {
      case 'Delete':
      case 'Backspace': {
        if (target.selectionStart !== 0 || target.selectionEnd !== 0)
          break

        if (selectedElement.value) {
          const index = collection.findIndex(i => i === selectedElement.value)
          modelValue.value.splice(index, 1)
          selectedElement.value = selectedElement.value === lastTag ? collection.at(index - 1) : collection.at(index + 1)
          event.preventDefault()
        }
        else if (event.key === 'Backspace') {
          selectedElement.value = lastTag
          event.preventDefault()
        }
        break
      }
      case 'Home':
      case 'End':
      case 'ArrowRight':
      case 'ArrowLeft': {
        const isArrowRight = (event.key === 'ArrowRight' && dir.value === 'ltr') || (event.key === 'ArrowLeft' && dir.value === 'rtl')
        const isArrowLeft = !isArrowRight
        // only focus on tags when cursor is at the first position
        if (target.selectionStart !== 0 || target.selectionEnd !== 0)
          break

        // if you press ArrowLeft, then we last tag
        if (isArrowLeft && !selectedElement.value) {
          selectedElement.value = lastTag
          event.preventDefault()
        }
        // if you press ArrowRight on last tag, you deselect
        else if (isArrowRight && lastTag && selectedElement.value === lastTag) {
          selectedElement.value = undefined
          event.preventDefault()
        }
        else if (selectedElement.value) {
          const el = useArrowNavigation(event, selectedElement.value, undefined, {
            itemsArray: collection,
            loop: false,
            dir: dir.value,
          })
          if (el)
            selectedElement.value = el
          event.preventDefault()
        }
        break
      }
      case 'ArrowUp':
      case 'ArrowDown': {
        if (selectedElement.value)
          event.preventDefault()
        break
      }
      default: {
        selectedElement.value = undefined
      }
    }
  },
  selectedElement,
  isInvalidInput,
  addOnPaste: toRef(props, 'addOnPaste'),
  dir,
  disabled: toRef(props, 'disabled'),
  delimiter: toRef(props, 'delimiter'),
  max: toRef(props, 'max'),
  id: toRef(props, 'id'),
})
</script>

<template>
  <CollectionSlot>
    <Primitive
      ref="primitiveElement"
      :dir="dir"
      :as="as"
      :as-child="asChild"
      :data-invalid="isInvalidInput ? '' : undefined"
      :data-disabled="disabled ? '' : undefined"
      :data-focused="focused ? '' : undefined"
    >
      <slot :values="modelValue" />

      <VisuallyHiddenInput
        v-if="isFormControl && name"
        :name="name"
        :value="modelValue"
        :required="required"
        :disabled="disabled"
      />
    </Primitive>
  </CollectionSlot>
</template>
