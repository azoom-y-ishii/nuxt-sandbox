import { db } from '@/drizzle/connection'
import { CitySchema } from '@/drizzle/schema'

const endpoint = defineEndpoint({
  responses: {
    200: {
      description: 'List city data',
      content: {
        'application/json': {
          schema: z.array(CitySchema),
        },
      },
    },
  },
})

export default endpoint.defineEventHandler(async (event) => {
  return await db.query.user.findMany()
})
