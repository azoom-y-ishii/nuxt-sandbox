import { db } from '@/drizzle/connection'
import { UserSchema } from '@/drizzle/schema'

const endpoint = defineEndpoint({
  responses: {
    200: {
      description: 'List user data',
      content: {
        'application/json': {
          schema: z.array(UserSchema),
        },
      },
    },
  },
})

export default endpoint.defineEventHandler(async (event) => {
  return await db.query.user.findMany()
})
