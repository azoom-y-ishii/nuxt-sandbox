export const endpoint = defineEndpoint({
  operationId: 'getUser',
  request: {
    params: z.object({ id: z.coerce.number() }),
  },
  responses: {
    200: {
      description: 'Get user data',
      content: {
        'application/json': {
          schema: z.object({ id: z.number(), name: z.string(), age: z.number().optional() }),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
})

export default endpoint.defineEventHandler((event) => {
  if (event.context.params.id) {
    return {
      id: 1,
      name: 'Tom',
      age: 20,
    }
  } else {
    return createResponse({
      status: 400,
      data: { message: 'hogehoge' },
    })
  }
})
