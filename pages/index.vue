<template>
  <input v-model="email">
  <div>
    <pre>{{ result?.error?.issues }}</pre>
  </div>
</template>

<script setup lang="ts">
import freeEmailDomains from 'free-email-domains'
import { type StringValidation, z } from 'zod'

const schema = z.object({
  email: z.string().email().superRefine((data, context) => {
    const [_, domain] = data.split('@')
    const isValid = domain ? !freeEmailDomains.includes(domain) : true
    if (!isValid) {
      return context.addIssue({
        code: z.ZodIssueCode.invalid_string,
        validation: 'none_free_email' as StringValidation,
      })
    }
  }),
})

const email = ref<string>('test@gmail.com')
const result = ref<ReturnType<typeof schema.safeParse> | undefined>()

watch(email, (value) => {
  result.value = schema.safeParse({ email: value })
}, { immediate: true })
</script>
