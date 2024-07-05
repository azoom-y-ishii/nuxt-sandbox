<template>
  <div>
    <form>
      <input
        type="text"
        v-model="user.name"
        v-bind="attrs('name')"
      >
      <p>{{ isTouched('name') }}</p>
      <p>{{ isDirty('name') }}</p>
      <div>
        <div
          v-for="(link, index) in user.links"
          :key="index"
        >
          <input
            type="text"
            v-model="user.links[index].name"
            v-bind="attrs(['links', index, 'name'])"
          > {{ isDirty(['links', index, 'name']) }}
        </div>

        <button
          type="button"
          @click="user.links.push({ name: '', url: '' })"
        >
          タグを追加
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

const schema = z.object({
  name: z.string().max(10),
  age: z.number(),
  address: z.object({
    country: z.string(),
    city: z.string(),
  }),
  links: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
  })),
})

type User = z.infer<typeof schema>

const user = ref<User>({
  name: 'John Doe',
  age: 30,
  address: {
    country: 'USA',
    city: 'New York',
  },
  links: [
    {
      name: 'GitHub',
      url: 'https://github.com',
    },
  ],
})

const { isDirty, isValid, attrs, isTouched } = useValidation(user, schema)
</script>
