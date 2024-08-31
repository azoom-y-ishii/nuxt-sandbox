<template>
  <div>
    <h1>Hello World</h1>
    <TestView />
  </div>
</template>

<script setup lang="ts">
import NestedView from '~/components/nested-view.vue'
import TestView from '~/components/test-view.vue'

const { defineOperation } = useOrchestrator()

defineOperation(TestView, 'save', (message: string) => {
  console.log(message)
})

defineOperation(TestView, 'update', (count: number, message: string) => {
  console.log(count, message)
})

defineOperation(NestedView, 'save', (message: string) => {
  console.log('save', message)
})

defineOperation(NestedView, 'update', (count: number, message: string) => {
  console.log('update', count, message)
})
</script>
