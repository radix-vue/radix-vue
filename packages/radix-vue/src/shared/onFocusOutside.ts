import { type MaybeElementRef, unrefElement, useEventListener } from '@vueuse/core'
import { onMounted } from 'vue'

export function onFocusOutside(
  element: MaybeElementRef,
  handler: (event: FocusEvent) => void,
) {
  const handleFocusOut = (ev: FocusEvent) => {
    const el = unrefElement(element)
    if (!ev.relatedTarget)
      return
    const isFocusInsideElement = el?.contains(ev.relatedTarget as Node)

    if (!isFocusInsideElement)
      handler(ev)
  }

  onMounted(() => {
    const el = unrefElement(element)
    useEventListener(el, 'focusout', handleFocusOut)
  })
}
