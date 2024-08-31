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
const emit = defineEmits<{
  save: [message: string]
  update: [count: number, message: string]
}>()

const { $operate } = useOperator(emit)

const onSave = () => {
  $operate('save', 'saving from test')
}

const onUpdate = () => {
  $operate('update', 1, 'updating from test')
}
</script>
