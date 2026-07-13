import { boolean, email, z, uuid, int, nonnegative, optional, regex } from "zod";

export const signUpValidation =  z.object({
    firstName : z.string(),
    lastName : z.string(),
    userName : z.string(),

    email : z.string().email(),

    password : z.string()
    
})

export const logInValidation =  z.object({
    identifier : z.string().min(1,"email or username required"),
    password :  z.string().min(1, "password required"),
})

export const idValidation =  z.object({
    id : z.string(),
    password : z.string()
})

export const pantryItemValidation = z.object({
    name : z.string(),
    quantity : z.number(),
    unit : z.string(),
    category : z.string(),
    expiry_date : z.string(),
    is_running_low : boolean(),
})

export const idPantryValidation = z.object({
    id : z.string().uuid(),
})

export const pantryQuerySchema = z.object({
  category: z.string().trim().optional(),

  search: z.string().trim().min(1).optional(),

  isRunningLow: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),

  page: z.coerce.number().min(1).default(1),

  limit: z.coerce.number().min(1).max(50).default(10),
});

export const createMealPlanSchema = z.object({
    recipeId: z.string().uuid("Invalid recipe ID format"),
    mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    mealType: z.enum(["breakfast", "lunch", "dinner"], {
        errorMap: () => ({ message: "mealType must be 'breakfast', 'lunch', or 'dinner'" })
    })                  
});

export const idParamSchema = z.object({
    id: z.string().uuid("Invalid meal plan ID format")
});

export const createRecipeSchema = z.object({
    name: z.string().min(1, "Recipe name is required"),
    description: z.string().optional(),
    cuisine: z.string().optional(),
    difficulty: z.string().optional(),
    prepTime: z.number().int().positive().optional(),
    servings: z.number().int().positive().optional(),
    instructions: z.array(z.string()).min(1, "At least one instruction step is required"), // Stored as JSON array
    nutrition: z.object({
        calories: z.number().int().nonnegative().optional(),
        protein: z.number().int().nonnegative().optional(),
        carbs: z.number().int().nonnegative().optional(),
        fats: z.number().int().nonnegative().optional(),
        fiber: z.number().int().nonnegative().optional(),
    }).optional(),
    ingredients: z.array(
        z.object({
            name: z.string().min(1, "Ingredient name is required"),
            quantity: z.number().positive("Quantity must be positive"),
            unit: z.string().min(1, "Measurement unit is required")
        })
    ).min(1, "At least one ingredient is required")
});

export const generateListSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
});

// const idParamSchema = z.object({
//     id: z.string().uuid("Invalid shopping list item ID format")
// });

export const createItemSchema = z.object({
    ingredient_name: z.string().min(1, "Ingredient name is required"),
    quantity: z.string().min(1, "Quantity is required"), // Decimal quantities supported as string
    unit: z.string().min(1, "Unit is required"),
    category: z.string().optional()
});

export const updateItemSchema = z.object({
    ingredient_name: z.string().optional(),
    quantity: z.string().optional(),
    unit: z.string().optional(),
    category: z.string().optional(),
    is_checked: z.boolean().optional()
});


