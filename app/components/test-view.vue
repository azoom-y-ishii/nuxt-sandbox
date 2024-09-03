<template>
  <div>
    <h1>Test</h1>
    <button @click="onSave">Save</button>
    <button @click="onUpdate">Update</button>

    <NestedView />
  </div>
</template>

<script lang="ts">
</script>

<script setup lang="ts">
defineEmits<{
  save: [message: string]
  update: [count: number, message: string]
}>()

const { emit } = useScopedEmit()

const onSave = () => {
  emit('save', 'saving from test')
}

const onUpdate = () => {
  emit('update', 1, 'updating from test')
}
</script>
