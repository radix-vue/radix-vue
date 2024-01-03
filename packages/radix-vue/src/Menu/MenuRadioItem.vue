<script lang="ts">
import type {
  MenuItemEmits,
  MenuItemProps,
} from './MenuItem.vue'

export type MenuRadioItemEmits = MenuItemEmits

export interface MenuRadioItemProps extends MenuItemProps {
  value: string
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { getCheckedState } from './utils'
import MenuItem from './MenuItem.vue'
import { injectMenuRadioGroupContext } from './MenuRadioGroup.vue'
import { provideMenuItemIndicatorContext } from './MenuItemIndicator.vue'

const props = defineProps<MenuRadioItemProps>()
const emits = defineEmits<MenuRadioItemEmits>()

const radioGroupContext = injectMenuRadioGroupContext()
const checked = computed(
  () => radioGroupContext.modelValue.value === props.value,
)

provideMenuItemIndicatorContext({ checked })
</script>

<template>
  <MenuItem
    role="menuitemradio"
    v-bind="props"
    :aria-checked="checked"
    :data-state="getCheckedState(checked)"
    @select="
      (event) => {
        emits('select', event);
        radioGroupContext.onValueChange(value);
      }
    "
  >
    <slot />
  </MenuItem>
</template>
