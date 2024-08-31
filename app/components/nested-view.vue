<template>
  <h1>Nested</h1>
  <button @click="onSave">Save</button>
  <button @click="onUpdate">Update</button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  save: [message: string]
  update: [count: number, message: string]
}>()

const { $operate } = useOperator(emit)

const onSave = () => {
  $operate('save', 'saving from nested')
}

const onUpdate = () => {
  $operate('update', 1, 'updating from nested')
}
</script>
