import { z } from 'zod'

export const endpoint = defineEndpoint({
  operationId: 'createUser',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({ name: z.string(), age: z.number().optional() }),
        },
        'application/yaml': {
          schema: z.string(),
        },
      },
    },
    headers: z.object({
      foo: z.literal('bar').or(z.literal('baz')),
    }),
  },
  responses: {
    200: {
      description: 'Return created user data',
      content: {
        'application/json': {
          schema: z.object({ id: z.number(), name: z.string(), age: z.number() }),
        },
      },
    },
  },
})

export default endpoint.defineEventHandler(() => {
  return {
    id: 3,
    name: 'Sid',
    age: 30,
  }
})
