import type { ModelValue } from './TabsRoot.vue'

export function makeTriggerId(baseId: string, value: ModelValue) {
  return `${baseId}-trigger-${value}`
}

export function makeContentId(baseId: string, value: ModelValue) {
  return `${baseId}-content-${value}`
}
