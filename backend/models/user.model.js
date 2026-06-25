import { pgTable, varchar, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  firstName: varchar("First_Name", { length: 255 }).notNull(),
  lastName: varchar("Last_Name", { length: 255 }),
  userName: varchar("User_Name", { length: 255 }).notNull(),

  email: text("email").notNull().unique(),

  password: text("password").notNull(),
  salt: text("salt").notNull(),

  createdAt: timestamp('Created_At').defaultNow().notNull(),
  updatedAt: timestamp("Updated_At").$onUpdate(() => new Date())
});