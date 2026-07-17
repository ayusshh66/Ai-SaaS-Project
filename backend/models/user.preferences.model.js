import { pgTable, uuid, text, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./user.model.js";
import { relations } from "drizzle-orm";

export const userPreferencesTable = pgTable("user_preferences", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .unique()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    
    dietaryRestrictions: jsonb("dietary_restrictions"), 
    
    preferredCuisines: jsonb("preferred_cuisines"),     
    
    defaultServings: integer("default_servings").default(2), 
    
    spiceLevel: text("spice_level"),
    dailyCalories: integer("daily_calories"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Relational configuration for Drizzle
export const userPreferencesRelations = relations(userPreferencesTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [userPreferencesTable.userId],
        references: [usersTable.id],
    }),
}));