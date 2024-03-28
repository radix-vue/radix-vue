<script lang="ts">
export interface ListboxVirtualizerProps<T extends AcceptableValue = AcceptableValue> {
  options: T[]
  estimateSize?: number
  textContent?: (option: T) => string
}
</script>

<script setup lang="ts" generic="T extends AcceptableValue = AcceptableValue">
import { useVirtualizer } from '@tanstack/vue-virtual'
import { cloneVNode, computed, useSlots } from 'vue'
import { injectListboxRootContext } from './ListboxRoot.vue'
import { type AcceptableValue, compare, queryCheckedElement } from './utils'
import { MAP_KEY_TO_FOCUS_INTENT } from '@/RovingFocus/utils'
import { refAutoReset } from '@vueuse/shared'
import { getNextMatch } from '@/shared/useTypeahead'

const props = defineProps<ListboxVirtualizerProps<T>>()

defineSlots<{
  default(props: {
    option: T
  }): any
}>()

const slots = useSlots()
const rootContext = injectListboxRootContext()

// set virtual true when this component mounted
rootContext.isVirtual.value = true

const padding = computed(() => {
  const el = rootContext.containerElement.value
  if (!el) { return { start: 0, end: 0 } }
  else {
    const styles = window.getComputedStyle(el)
    return {
      start: Number.parseFloat(styles.paddingBlockStart || styles.paddingTop),
      end: Number.parseFloat(styles.paddingBlockEnd || styles.paddingBottom),
    }
  }
})

const virtualizer = useVirtualizer(
  {
    get scrollPaddingStart() { return padding.value.start },
    get scrollPaddingEnd() { return padding.value.end },
    get count() { return props.options.length },
    estimateSize() {
      return 28
    },
    getScrollElement() { return rootContext.containerElement.value },
    overscan: 12,
  },
)

const virtualizedItems = computed(() => virtualizer.value.getVirtualItems().map((item) => {
  return {
    item,
    is: cloneVNode(slots.default!({
      option: props.options[item.index],
    })![0], {
      'key': `${item.index}`,
      'data-index': item.index,
      'aria-setsize': props.options.length,
      'aria-posinset': item.index + 1,
      'style': {
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `translateY(${item.start}px)`,
        overflowAnchor: 'none',
      },
    }),
  }
}))

rootContext.virtualFocusHook.on((event) => {
  const index = props.options.findIndex((option) => {
    if (Array.isArray(rootContext.modelValue.value))
      return compare(option, rootContext.modelValue.value[0], rootContext.by)
    else
      return compare(option, rootContext.modelValue.value!, rootContext.by)
  })
  if (index !== -1) {
    event?.preventDefault()

    virtualizer.value.scrollToIndex(index, { align: 'start' })
    requestAnimationFrame(() => {
      const item = queryCheckedElement(rootContext.containerElement.value)
      if (item && event)
        item?.focus()
    })
  }
})

// Reset `search` 1 second after it was last updated
const search = refAutoReset('', 1000)
const optionsWithMetadata = computed(() => {
  const parseTextContent = (option: T) => {
    if (props.textContent)
      return props.textContent(option)
    else
      return option.toString().toLowerCase()
  }

  return props.options.map((option, index) => ({
    index,
    textContent: parseTextContent(option),
  }))
})

rootContext.virtualKeydownHook.on((event) => {
  const isMetaKey = event.altKey || event.ctrlKey || event.metaKey
  const isTabKey = event.key === 'Tab' && !isMetaKey
  if (isMetaKey || isTabKey)
    return

  const intent = MAP_KEY_TO_FOCUS_INTENT[event.key]

  if (['first', 'last'].includes(intent)) {
    event.preventDefault()

    const index = intent === 'first' ? 0 : props.options.length - 1
    virtualizer.value.scrollToIndex(index)
    requestAnimationFrame(() => {
      const items = rootContext.containerElement.value.querySelectorAll('[data-radix-vue-collection-item][data-active=true]')
      const item = intent === 'first' ? items[0] : items[items.length - 1]
      if (item instanceof HTMLElement)
        item.focus()
    })
  }
  else if (!intent) {
    search.value += event.key
    const currentIndex = Number(document.activeElement?.getAttribute('data-index'))
    const currentMatch = props.options[currentIndex].toString().toLowerCase()
    const filteredOptions = optionsWithMetadata.value.map(i => i.textContent)
    const next = getNextMatch(filteredOptions, search.value, currentMatch)

    const nextMatch = optionsWithMetadata.value.find(option => option.textContent === next)
    if (nextMatch) {
      virtualizer.value.scrollToIndex(nextMatch.index, { align: 'start' })
      requestAnimationFrame(() => {
        const item = rootContext.containerElement.value.querySelector(`[data-active="true"][data-index="${nextMatch.index}"]`)
        if (item instanceof HTMLElement)
          item.focus()
      })
    }
  }
})
</script>

<template>
  <div
    data-radix-vue-virtualizer
    :style="{
      position: 'relative',
      width: '100%',
      height: `${virtualizer.getTotalSize()}px`,
    }"
  >
    <component
      :is="is"
      v-for="{ is, item } in virtualizedItems"
      :key="item.index"
    />
  </div>
</template>
