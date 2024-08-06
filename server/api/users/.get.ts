export const endpoint = defineEndpoint({
  request: {
    query: z.object({ name: z.string().optional() }),
  },
  responses: {
    200: {
      description: 'List user data',
      content: {
        'application/json': {
          schema: z.array(z.object({ id: z.number(), name: z.string(), age: z.number().optional() })),
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

export default endpoint.defineEventHandler(async (event) => {
  if (event !== undefined) {
    const a = [
      {
        id: 1,
        name: 'Tom!!',
        age: 20,
      },
      {
        id: 2,
        name: 'Joe',
        age: 18,
      },
    ]
    return a
  } else {
    return createResponse({
      status: 400,
      data: { message: 'hogehoge' },
    })
  }
})
