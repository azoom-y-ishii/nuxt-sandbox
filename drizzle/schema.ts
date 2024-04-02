import { mysqlTable, serial, text } from 'drizzle-orm/mysql-core'
import { createSelectSchema } from 'drizzle-zod';

export const city = mysqlTable('city', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
})

export const CitySchema = createSelectSchema(city)

export const user = mysqlTable('user', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  cityId: serial('city_id').references(() => city.id),
})

export const UserSchema = createSelectSchema(user)