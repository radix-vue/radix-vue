<script setup lang="ts">
import { computed, ref } from 'vue'
import { ListboxItem, ListboxRoot, ListboxVirtualizer } from '../'
import { countryList } from './constants'

const filterText = ref('')
const filteredOptions = computed(() => {
  const options = countryList.map(a => ({ label: a, value: a }))
  return filterText.value ? options.filter(item => item.label.toLowerCase().includes(filterText.value.toLowerCase())) : options
})
</script>

<template>
  <Story
    title="Listbox/Demo"
    :layout="{ type: 'grid', iframe: false, width: '50%' }"
  >
    <Variant title="default">
      <ListboxRoot loop class="w-48 h-72 flex flex-col p-1 rounded-lg border bg-white text-green9 mx-auto">
        <ListboxItem v-for="i in 10" :key="i" :disabled="i === 5" :value="i" class="w-full py-1 px-2 text-green9 select-none text-sm focus:ring-0 focus:outline-green9 data-[state=checked]:bg-green9 data-[state=checked]:text-white data-[disabled]:opacity-50 rounded">
          Item {{ i }}
        </ListboxItem>
      </ListboxRoot>
    </Variant>

    <Variant title="multiple">
      <ListboxRoot :multiple="true" class="w-48 h-72 flex flex-col p-1 rounded-lg border bg-white text-green9 mx-auto">
        <ListboxItem v-for="i in 10" :key="i" :value="i" class="w-full py-1 px-2 text-green9 select-none text-sm focus:ring-0 focus:outline-green9 data-[state=checked]:bg-green9 data-[state=checked]:text-white data-[disabled]:opacity-50 rounded">
          Item {{ i }}
        </ListboxItem>
      </ListboxRoot>
    </Variant>

    <Variant title="replace behavior">
      <ListboxRoot :default-value="2" selection-behavior="replace" class="w-48 h-72 flex flex-col p-1 rounded-lg border bg-white text-green9 mx-auto">
        <ListboxItem v-for="i in 10" :key="i" :value="i" class="w-full py-1 px-2 text-green9 select-none text-sm focus:ring-0 focus:outline-green9 data-[state=checked]:bg-green9 data-[state=checked]:text-white data-[disabled]:opacity-50 rounded">
          Item {{ i }}
        </ListboxItem>
      </ListboxRoot>
    </Variant>

    <Variant title="long list">
      <ListboxRoot :default-value="600" class="w-48 h-72 overflow-auto p-1 rounded-lg border bg-white text-green9 mx-auto">
        <ListboxVirtualizer v-slot="{ option }" :options="[...Array(1000).keys()]">
          <ListboxItem :value="option" class="w-full py-1 px-2 text-green9 select-none text-sm focus:ring-0 focus:outline-green9 data-[state=checked]:bg-green9 data-[state=checked]:text-white rounded">
            Item {{ option }}
          </ListboxItem>
        </ListboxVirtualizer>
      </ListboxRoot>
    </Variant>

    <Variant title="filtering">
      <div class="w-48 h-72 p-1 rounded-lg border bg-white text-green9 mx-auto">
        <input v-model="filterText" type="text" class="border rounded w-full bg-white">
        <ListboxRoot :default-value="600" class="w-full h-64 overflow-auto">
          <ListboxVirtualizer v-slot="{ option }" :text-content="(option) => option.value" :options="filteredOptions">
            <ListboxItem :value="option" class="w-full py-1 px-2 text-green9 select-none text-sm focus:ring-0 focus:outline-green9 data-[state=checked]:bg-green9 data-[state=checked]:text-white rounded">
              {{ option.label }}
            </ListboxItem>
          </ListboxVirtualizer>
        </ListboxRoot>
      </div>
    </Variant>
  </Story>
</template>
