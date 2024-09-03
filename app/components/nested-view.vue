<template>
  <h1>Nested</h1>
  <button @click="onSave">Save</button>
  <button @click="onUpdate">Update</button>
</template>

<script setup lang="ts">
defineEmits<{
  save: [message: string]
  update: [count: number, message: string]
}>()
const { emit } = useScopedEmit()

const onSave = () => {
  emit('save', 'saving from nested')
}

const onUpdate = () => {
  emit('update', 1, 'updating from nested')
}
</script>
