/* eslint-disable ts/ban-types */
import { createContext } from '@/shared'
import { type Ref, computed, defineComponent, h, markRaw, ref, watch, watchEffect } from 'vue'
import { Slot, usePrimitiveElement } from '@/Primitive'

interface CollectionContext<ItemData = {}> {
  collectionRef: Ref<HTMLElement | undefined>
  itemMap: Ref<Map<HTMLElement, { ref: HTMLElement, value?: any } & ItemData>>
  attrName: string
}

const ITEM_DATA_ATTR = 'data-radix-vue-collection-item'

// TODO: Not sure how to pass generic types here from provideCollectionContext
export const [injectCollectionContext, provideCollectionContext]
  = createContext<CollectionContext>('CollectionProvider')

export function createCollection<ItemData = {}>(attrName = ITEM_DATA_ATTR) {
  const itemMap = ref<Map<HTMLElement, { ref: HTMLElement } & ItemData>>(new Map())
  const collectionRef = ref<HTMLElement>()

  // @ts-expect-error Type instantiation is excessively deep and possibly infinite.
  const context = provideCollectionContext({
    collectionRef,
    itemMap,
    attrName,
  }) as CollectionContext<ItemData>
  const { getItems } = useCollection(context)

  const reactiveItems = computed(() => Array.from(context.itemMap.value.values()))
  const itemMapSize = computed(() => context.itemMap.value.size)
  return { getItems, reactiveItems, itemMapSize }
}

export const CollectionSlot = defineComponent({
  name: 'CollectionSlot',
  setup(_, { slots }) {
    const context = injectCollectionContext()
    const { primitiveElement, currentElement } = usePrimitiveElement()
    watch(currentElement, () => {
      context.collectionRef.value = currentElement.value
    })
    return () => h(Slot, { ref: primitiveElement }, slots)
  },
})

export const CollectionItem = defineComponent({
  name: 'CollectionItem',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const context = injectCollectionContext()
    const { primitiveElement, currentElement } = usePrimitiveElement()
    const { value, ...restAttrs } = attrs

    watchEffect((cleanupFn) => {
      if (currentElement.value) {
        const key = markRaw(currentElement.value)
        context.itemMap.value.set(key, { ref: currentElement.value!, value })
        cleanupFn(() => context.itemMap.value.delete(key))
      }
    })

    return () => h(Slot, { ...restAttrs, [context.attrName]: '', ref: primitiveElement }, slots)
  },
})

export function useCollection<ItemData = {}>(fallback?: CollectionContext<ItemData>) {
  const context = fallback ?? injectCollectionContext() as CollectionContext<ItemData>

  const getItems = () => {
    const collectionNode = context.collectionRef.value
    if (!collectionNode)
      return []
    const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${context.attrName}]`))
    const items = Array.from(context.itemMap.value.values())
    const orderedItems = items.sort(
      (a, b) => orderedNodes.indexOf(a.ref) - orderedNodes.indexOf(b.ref),
    )
    return orderedItems
  }

  return { getItems }
}
