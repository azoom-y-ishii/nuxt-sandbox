<template>
  <h1>Modal {{ message }}</h1>
  <button @click="onSave">Modal Save</button>
</template>

<script setup lang="ts">
import { inject } from 'vue'

defineProps<{
  message: string
}>()

defineEmits<{
  save: []
}>()

const { emit } = useScopedEmit()

const onSave = () => {
  emit('save')
}
</script>
