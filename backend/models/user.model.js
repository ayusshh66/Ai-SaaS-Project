import { pgTable, varchar, text, timestamp, uuid, integer, numeric, boolean, jsonb, date, unique } from "drizzle-orm/pg-core";
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
  expiryDate: text('expiry_date'),
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
  cookTime: integer('cook_time'),
  dietaryTags: jsonb('dietary_tags').default([]),
  instructions: jsonb('instructions').notNull(), // stores steps array natively //jsonb used when the data is being entered by api
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const recipeNutritionTable = pgTable('recipe_nutrition', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipeId: uuid('recipe_id').references(() => recipesTable.id, { onDelete: 'cascade' }).notNull().unique(), // Unique constraint guarantees 1-to-1
  calories: integer('calories'),
  protein: integer('protein'), // in grams
  carbs: integer('carbs'),     // in grams
  fats: integer('fats'),       // in grams
  fiber: integer('fiber'),     // in grams
});

//recipe ingredients 
export const recipeIngredientsTable = pgTable('recipe_ingredients', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipeId: uuid('recipe_id').references(() => recipesTable.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  quantity: numeric('quantity').notNull(),
  unit: text('unit').notNull()
});

//MEAL PLANS eg. breakfast, lunch, dinner
export const mealPlansTable = pgTable('meal_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
  recipeId: uuid('recipe_id').references(() => recipesTable.id, { onDelete: 'cascade' }).notNull(),
  mealDate: date('meal_date').notNull(), // Use simple date format
  mealType: text('meal_type').notNull(), // 'breakfast' | 'lunch' | 'dinner'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date())
}, (table) => ({
  //this is a constraint if we try to add more than 1 meal in mealplan at a given slot eg lunch, then it will restrict it and we can update it in further router
  userMealDateTypeUnique: unique('user_meal_date_type_unique').on(table.userId, table.mealDate, table.mealType)
}));

//shopping list itmes
export const shoppingListItemsTable = pgTable('shopping_list_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
  ingredientName: text('ingredient_name').notNull(),
  quantity: numeric('quantity').notNull(), // Supports decimal quantities (like 1.5 kg)
  unit: text('unit').notNull(),
  category: text('category').default('Uncategorized').notNull(),
  fromMealPlan: boolean('from_meal_plan').default(false).notNull(),
  isChecked: boolean('is_checked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date())
});

// Define Relationships for easy joining
export const usersRelations = relations(usersTable, ({ many, one }) => ({
  pantryItems: many(pantryItemsTable),
  recipes: many(recipesTable),
  mealPlans: many(mealPlansTable),
  shoppingListItems: many(shoppingListItemsTable),
  preferences: one(userPreferencesTable)
}));

export const pantryItemsRelations = relations(pantryItemsTable, ({ one }) => ({
  user: one(usersTable, { fields: [pantryItemsTable.userId], references: [usersTable.id] }),
}));

export const recipesRelations = relations(recipesTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [recipesTable.userId],
    references: [usersTable.id],
  }),
  
  nutrition: one(recipeNutritionTable, {
    fields: [recipesTable.id],          
    references: [recipeNutritionTable.recipeId],
  }),
  ingredients: many(recipeIngredientsTable),
}));

// relationships for the new nutrition table
export const recipeNutritionRelations = relations(recipeNutritionTable, ({ one }) => ({
  recipe: one(recipesTable, {
    fields: [recipeNutritionTable.recipeId],
    references: [recipesTable.id],
  }),
}));

export const recipeIngredientsRelations = relations(recipeIngredientsTable, ({ one }) => ({
  recipe: one(recipesTable, {
    fields: [recipeIngredientsTable.recipeId],
    references: [recipesTable.id], 
  }),
}));

export const mealPlansRelations = relations(mealPlansTable, ({ one }) => ({
  user: one(usersTable, { fields: [mealPlansTable.userId], references: [usersTable.id] }),
  recipe: one(recipesTable, { fields: [mealPlansTable.recipeId], references: [recipesTable.id] })
}));

export const shoppingListItemsRelations = relations(shoppingListItemsTable, ({ one }) => ({
  user: one(usersTable, { fields: [shoppingListItemsTable.userId], references: [usersTable.id] })
}));

