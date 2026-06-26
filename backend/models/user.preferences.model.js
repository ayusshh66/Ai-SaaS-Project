import { pgTable,  } from "drizzle-orm/pg-core";
import { usersTable } from "./user.model.js"; 

export const userPreferencesTable = pgTable("user_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    }),

  diet: text("diet"),

  preferredCuisine: text("preferred_cuisine"),

  spiceLevel: text("spice_level"),

  allergies: jsonb("allergies").$type<string[]>(),

  dailyCalories: integer("daily_calories"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});