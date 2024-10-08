import { useEventListener } from '@vueuse/core'

export function handleAndDispatchCustomEvent<
  E extends CustomEvent,
  OriginalEvent extends Event,
>(
  name: string,
  handler: ((event: E) => void) | undefined,
  detail: { originalEvent: OriginalEvent } & (E extends CustomEvent<infer D>
    ? D
    : never),
) {
  const target = detail.originalEvent.target
  const event = new CustomEvent(name, {
    bubbles: false,
    cancelable: true,
    detail,
  })
  if (handler)
    useEventListener(target, handler as EventListener, { once: true })

  target.dispatchEvent(event)
}
