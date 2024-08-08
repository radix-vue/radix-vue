<script setup lang="ts">
import { ref } from 'vue'
import { ComboboxAnchor, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxRoot, type ComboboxRootEmits, type ComboboxRootProps, ComboboxTrigger, ComboboxViewport } from '../'
import { Icon } from '@iconify/vue'
import { useForwardPropsEmits } from '@/shared'

const props = defineProps<ComboboxRootProps>()
const emits = defineEmits<ComboboxRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
const v = ref<string>()
</script>

<template>
  <ComboboxRoot
    v-bind="forwarded"
    v-model="v"
    name="test"
    :display-value="(val) => `Option #${val}`"
    :filter-function="(opts: ReadonlyArray<any>, search: string) => opts.filter((opt) => opt.includes(search))"
  >
    <ComboboxAnchor class="min-w-[160px] inline-flex items-center justify-between rounded px-[15px] text-[13px] leading-none h-[35px] gap-[5px] bg-white text-grass11 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-grass9 outline-none">
      <ComboboxInput
        class="bg-transparent outline-none text-grass11 placeholder-gray-400"
        placeholder="Placeholder..."
      />
      <ComboboxTrigger>
        <Icon
          icon="radix-icons:chevron-down"
          class="h-4 w-4 text-grass11"
        />
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxContent class="mt-2 min-w-[160px] bg-white overflow-hidden rounded shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade">
      <ComboboxViewport class="p-[5px]">
        <ComboboxEmpty class="text-gray-400  text-xs font-medium text-center py-2" />

        <ComboboxItem
          v-for="i in 1000"
          :key="i"
          :value="`${i}`"
        >
          <ComboboxItemIndicator
            class="absolute left-0 w-[25px] inline-flex items-center justify-center"
          >
            <Icon icon="radix-icons:check" />
          </ComboboxItemIndicator>
          <span>
            Option #{{ i }}
          </span>
        </ComboboxItem>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>
