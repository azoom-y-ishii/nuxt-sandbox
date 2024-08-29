<template>
  <h1>Hello World</h1>

  <h2>Normal</h2>
  <div>
    {{ normalResponse.createdAt }}
  </div>

  <h2>Serialized</h2>
  <div>
    {{ serializedResponse.createdAt }}
  </div>

  <h2>SuperJSON</h2>
  <div>
    {{ format(superJsonResponse.createdAt, 'yyyy/MM/dd') }}
  </div>
</template>

<script setup lang="ts">
import superjson from 'superjson'
import { format } from 'date-fns'

const { data: normalResponse } = await useFetch('/api/normal')
const { data: serializedResponse } = await useFetch('/api/serialized')

const { data: superJsonResponse } = await useFetch('/api/superjson', {
  transform: (value) => {
    return superjson.parse(value as unknown as string) as Omit<typeof value, 'toJSON'>
  },
})
</script>
