<template>
  <div>
    <h1>Hello World</h1>
    <TestView />
    <button @click="addComp">Add Component</button>
    <Component :is="comp" />
  </div>
</template>

<script setup lang="ts">
import NestedView from '~/components/nested-view.vue'
import TestView from '~/components/test-view.vue'
import Modal from '~/components/modal.vue'

const { defineEventDispatcher, provideEventBus } = useScopedEventBus()

const comp = ref()
const addComp = () => {
  comp.value = h(provideEventBus(Modal), { message: 'baz' })
}

defineEventDispatcher(TestView, {
  save: (message: string) => {
    console.log(message)
  },
  update: (count: number, message: string) => {
    console.log(count, message)
  },
})

defineEventDispatcher(Modal, {
  save: () => {
    console.log('modal save')
  },
})

defineEventDispatcher(NestedView, {
  save: (message: string) => {
    console.log('save', message)
  },
  update: (count: number, message: string) => {
    console.log('update', count, message)
  },
})
</script>
