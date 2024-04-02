import { db } from '@/drizzle/connection'
import { CitySchema, city } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

const endpoint = defineEndpoint({
  request: {
    params: z.object({
      id: z.number()
    })
  },
  responses: {
    200: {
      description: 'List user data',
      content: {
        'application/json': {
          schema: CitySchema,
        },
      },
    },
  },
})

export default endpoint.defineEventHandler(async (event) => {
  return await db.query.city.findFirst({ where: eq(city.id, event.context.params.id)})
})
