import { pgTable, varchar, text, timestamp, uuid, integer, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { userPreferencesTable } from "./user.preferences.model.js";

// users table
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

// pantry item  table
export const pantryItemsTable = pgTable('pantry_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  quantity: numeric('quantity').notNull(),
  unit: text('unit').notNull(),
  category: text('category'),
  expiryDate: timestamp('expiry_date'),
  isRunningLow: boolean('is_running_low').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// recipes table 
export const recipesTable = pgTable('recipes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  cuisine: text('cuisine'),
  difficulty: text('difficulty'),
  prepTime: integer('prep_time'),
  servings: integer('servings'),
  instructions: jsonb('instructions').notNull(), // stores steps array natively //jsonb used when the data is being entered by api
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define Relationships for easy joining
export const usersRelations = relations(usersTable, ({ many, one }) => ({
  pantryItems: many(pantryItemsTable),
  recipes: many(recipesTable),
  preferences : one(userPreferencesTable)
}));

export const pantryItemsRelations = relations(pantryItemsTable, ({ one }) => ({
  user: one(usersTable, { fields: [pantryItemsTable.userId], references: [usersTable.id] }),
}));

export const recipesRelations = relations(recipesTable, ({ one }) => ({
  user: one(usersTable, { fields: [recipesTable.userId], references: [usersTable.id] }),
}));