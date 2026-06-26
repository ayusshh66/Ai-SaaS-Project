import { pgTable,uuid, text, jsonb, timestamp, integer,boolean,  } from "drizzle-orm/pg-core";
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

  allergies: jsonb("allergies"),

  dailyCalories: integer("daily_calories"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

// making relation so that drizzle will know, and avoiding leftjoints
export const userPreferencesRelations = relations(
  userPreferencesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userPreferencesTable.userId],
      references: [usersTable.id],
    }),
  })
);