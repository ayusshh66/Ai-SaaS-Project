import express from 'express';
import { authentication } from '../middleware/auth.js';
import db from '../src/index.js';
import { recipeNutritionTable, recipesTable, recipeIngredientsTable, pantryItemsTable } from '../models/user.model.js';
import { and, eq, ilike, desc, count, countDistinct, avg, lte, gte } from 'drizzle-orm';
import { idPantryValidation, createMealPlanSchema, createRecipeSchema, idParamSchema } from '../validators/signupValidation.js';
import { generateRecipe } from '../utils/gemini.js';

const recipeRouter = express.Router();

recipeRouter.post('/generate', authentication, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const { 
            ingredients = [],         // E.g., ["salt"] (manually typed chips)
            usePantryIngredients,     // The boolean for toggle
            dietaryRestrictions = [], 
            cuisineType, 
            servings = 2, 
            cookingTime 
        } = req.body;

        let finalIngredients = [...ingredients];
        let priorityIngredients = []; // To track items expiring soon or running low

        if (usePantryIngredients === true) {
            const userPantryList = await db
                .select()
                .from(pantryItemsTable)
                .where(eq(pantryItemsTable.userId, userId));

            const today = new Date();

            userPantryList.forEach(item => {
                let isPriority = item.isRunningLow === true;

                // Handle the expiry date validation
                if (item.expiryDate) {
                    const expiry = new Date(item.expiryDate);
                    
                    // If the food is already expired, don't cook with it
                    if (expiry < today) {
                        return;
                    }

                    // If it expires within the next 3 days, flag it as high-priority
                    const threeDaysFromNow = new Date();
                    threeDaysFromNow.setDate(today.getDate() + 3);
                    
                    if (expiry <= threeDaysFromNow) {
                        isPriority = true;
                    }
                }

                // Push to the correct array tracking system
                if (isPriority) {
                    priorityIngredients.push(item.name);
                } else {
                    finalIngredients.push(item.name);
                }
            });

            // Combine arrays and eliminate any duplicate ingredient names
            finalIngredients = Array.from(new Set([...finalIngredients, ...priorityIngredients]));
        }

        // 3. Guard Clause: Make sure they provided something to work with
        if (finalIngredients.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Please add at least one ingredient or check 'Use pantry items'!"
            });
        }

        // 4. Pass the custom combined arrays over to your Gemini API function
        const generatedRecipe = await generateRecipe({
            ingredients: finalIngredients,
            priorityIngredients: priorityIngredients, // Tells the AI what needs to be used up first!
            dietaryRestrictions,
            cuisineType,
            servings,
            cookingTime
        });

        return res.status(200).json({
            status: "success",
            data: generatedRecipe
        });

    } catch (error) {
        console.error("Recipe generation failed:", error);
        return res.status(500).json({ error: "Internal server error generating recipe" });
    }
})

recipeRouter.post('/recipe', authentication, async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            name,
            description,
            cuisine_type,
            difficulty,
            prep_time,
            cook_time,
            servings,
            instructions,
            dietary_tags = [], // Capturing the array from frontend mapping
            ingredients = [],  // Array: [{ name: '...', quantity: 2, unit: 'g' }]
            nutrition         // Object: { calories: 400, protein: 30, carbs: 45, fats: 12, fiber: 5 }
        } = req.body;

        // 2. Start the database transaction
        const savedData = await db.transaction(async (tx) => {
            
            // Insert into recipesTable 
            const [newRecipe] = await tx.insert(recipesTable).values({
                userId: userId,
                name: name,
                description: description,
                cuisine: cuisine_type, 
                difficulty: difficulty,
                prepTime: Number(prep_time || 0),   // Saved cleanly to 'prep_time'
                cookTime: Number(cook_time || 0),   // Saved cleanly to 'cook_time'
                servings: Number(servings || 2),
                dietaryTags: dietary_tags,          // Saved natively to your jsonb 'dietary_tags' column
                instructions: instructions,         // Stores steps array natively in jsonb
            }).returning();

            const recipeId = newRecipe.id;

            //  Bulk insert ingredients linked to this generated recipe ID
            let savedIngredients = [];
            if (ingredients.length > 0) {
                const ingredientsToInsert = ingredients.map(ing => ({
                    recipeId: recipeId,
                    name: ing.name,
                    quantity: String(ing.quantity), // Kept as string to support fractional units safely
                    unit: ing.unit
                }));

                savedIngredients = await tx.insert(recipeIngredientsTable)
                    .values(ingredientsToInsert)
                    .returning();
            }

            //Insert nutrition values 
            let savedNutrition = null;
            if (nutrition) {
                const [nutritionResult] = await tx.insert(recipeNutritionTable).values({
                    recipeId: recipeId,
                    calories: Number(nutrition.calories || 0),
                    protein: Number(nutrition.protein || 0),
                    carbs: Number(nutrition.carbs || 0),
                    fats: Number(nutrition.fats || 0),
                    fiber: Number(nutrition.fiber || 0)
                }).returning();
                
                savedNutrition = nutritionResult;
            }

            return {
                recipe: newRecipe,
                ingredients: savedIngredients,
                nutrition: savedNutrition
            };
        });

        return res.status(201).json({
            status: "success",
            message: "Recipe along with detailed ingredients, nutrition, and tags saved!",
            data: savedData
        });

    } catch (error) {
        console.error("Database transaction failure while saving complete recipe metadata:", error);
        return res.status(500).json({ error: "Internal server error saving full recipe dataset structure" });
    }
});

recipeRouter.get("/", authentication, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            search, cuisine, difficulty, max_prep_time, 
            max_calories, min_protein, max_fats, 
            sort_by, sort_order, limit, offset 
        } = req.query;

        const conditions = [eq(recipesTable.userId, userId)];

        if (search) conditions.push(ilike(recipesTable.name, `%${search}%`));

        if (cuisine) conditions.push(eq(recipesTable.cuisine, cuisine));

        if (difficulty) conditions.push(eq(recipesTable.difficulty, difficulty));

        if (max_prep_time) conditions.push(lte(recipesTable.prepTime, Number(max_prep_time)));

        if (max_calories) conditions.push(lte(recipeNutritionTable.calories, Number(max_calories)));

        if (min_protein) conditions.push(gte(recipeNutritionTable.protein, Number(min_protein)));

        if (max_fats) conditions.push(lte(recipeNutritionTable.fats, Number(max_fats)));

        const queryLimit = limit ? Number(limit) : 20;
        const queryOffset = offset ? Number(offset) : 0;

        const validSortColumns = { prep_time: recipesTable.prepTime, name: recipesTable.name };
        const sortColumn = validSortColumns[sort_by] || recipesTable.createdAt;
        const finalOrder = sort_order === 'asc' ? sortColumn : desc(sortColumn);

        const results = await db.query.recipesTable.findMany({
            where: and(...conditions), 
            orderBy: finalOrder,
            limit: queryLimit,
            offset: queryOffset,
            with: {
                ingredients: true,
                nutrition: true
            }
        });

        return res.status(200).json({
            status: "success",
            count: results.length,
            data: results,
        });

    } catch (error) {
        console.error("GET /recipes error:", error); 
        return res.status(500).json({ error: "internal server error" });
    }
});

recipeRouter.get("/info/:id", authentication, async(req,res) => {

    try {

        const userId = req.user.id

        const request = await idParamSchema.safeParseAsync(req.params.id);

        if(request.error){
            return res.status(400).json({error : "enter valid id"})
        }

        const {id} = request.data;

        const info = await db.query.recipesTable.findFirst({
            where : (and(eq(recipesTable.userId, userId), eq(recipesTable.id, id))),
            orderBy: desc(recipesTable.createdAt), 
            with : {
                ingredients : true,
                nutrition : true,
            }

        })

        if (!info) {
            return res.status(404).json({ error: "Recipe not found" });
        }

        return res.status(200).json({status : "success",
            data : info
        })
        
    } catch (error) {
        return res.status(500).json({error : "Internal Server Error"})
    }

})

recipeRouter.patch('/update/:id', authentication, async(req,res) =>{
    
    try {
        const userId = req.user.id;
        const request = await idPantryValidation.safeParseAsync(req.params);

        if(!request.success){
            return res.status(400).json({error : request.error.format()});
        }

        const { id: recipeId } = request.data;
        const {nutrition, ingredients, ...recipeUpdates} = req.body;

        const updatedResult = await db.transaction(async(tx) => {
            const [existing] = await tx.select().from(recipesTable).where(and(eq(recipesTable.id, recipeId), eq(recipesTable.userId, userId)));
            if (!existing) return null;

            let updatedRecipe = null;
            if (Object.keys(recipeUpdates).length > 0) {
                [updatedRecipe] = await tx
                    .update(recipesTable)
                    .set(recipeUpdates)
                    .where(and(eq(recipesTable.id, recipeId), eq(recipesTable.userId, userId)))
                    .returning();
            } else {
                updatedRecipe = existing;
            }

            let updatedNutrition = null;
            if (nutrition) {
                [updatedNutrition] = await tx
                    .insert(recipeNutritionTable)
                    .values({
                        recipeId: recipeId,
                        calories: nutrition.calories ?? null,
                        protein: nutrition.protein ?? null,
                        carbs: nutrition.carbs ?? null,
                        fats: nutrition.fats ?? null,
                        fiber: nutrition.fiber ?? null,
                    })
                    .onConflictDoUpdate({
                        target: recipeNutritionTable.recipeId, 
                        set: {
                            calories: nutrition.calories,
                            protein: nutrition.protein,
                            carbs: nutrition.carbs,
                            fats: nutrition.fats,
                            fiber: nutrition.fiber,
                        }
                    })
                    .returning();
            }

            if (ingredients && Array.isArray(ingredients)) {
                await tx.delete(recipeIngredientsTable).where(eq(recipeIngredientsTable.recipeId, recipeId));
                
                if (ingredients.length > 0) {
                    const formattedIngredients = ingredients.map(ing => ({
                        recipeId,
                        name: ing.name,
                        quantity: String(ing.quantity),
                        unit: ing.unit
                    }));
                    await tx.insert(recipeIngredientsTable).values(formattedIngredients);
                }
            }

            return { ...updatedRecipe, nutrition: updatedNutrition };
        });

        if (!updatedResult) {
            return res.status(404).json({ error: "Recipe not found or unauthorized" });
        }

        return res.status(200).json({
            status: "success",
            message: "Recipe and nutrition card updated successfully",
            data: updatedResult
        });

    } catch (error) {
        return res.status(500).json({error : `Internal Server Error ${error}`})
    }
});

recipeRouter.get("/recent", authentication, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = req.query.limit ? Number(req.query.limit) : 5;

        const recentRecipes = await db.query.recipesTable.findMany({
            where: eq(recipesTable.userId, userId),
            orderBy: desc(recipesTable.createdAt), 
            limit: limit,
            with: {
                ingredients: true,
                nutrition: true
            }
        });

        return res.status(200).json({
            status: "success",
            data: recentRecipes
        });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error fetching recent recipes" });
    }
});

recipeRouter.delete('/delete/:id', authentication, async(req,res) => {
    try { 
        const userId = req.user.id;
        const request = await idPantryValidation.safeParseAsync(req.params);

        if(!request.success){
            return res.status(400).json({error : request.error.format()})
        }

        const { id } = request.data;
        const [deleteRecipe] = await db.delete(recipesTable).where(and(eq(recipesTable.id, id), eq(recipesTable.userId, userId))).returning();
        
        if(!deleteRecipe){
            return res.status(404).json({error : `there is no recipe`})
        }

        return res.status(200).json({status: "success", message: "successful!", data : {deleteRecipe}})

    } catch (error) {
        return res.status(500).json({error : `internal server error ${error}`})
    }
});

recipeRouter.get("/stats", authentication, async(req,res) => {
    try {
        const userId = req.user.id;

        const [stats] = await db.select({
            totalRecipes: count(recipesTable.id),
            cuisineCount: countDistinct(recipesTable.cuisine),
            avgPrepTime: avg(recipesTable.prepTime),
            avgCalories: avg(recipeNutritionTable.calories)
        })
        .from(recipesTable)
        .leftJoin(recipeNutritionTable, eq(recipeNutritionTable.recipeId, recipesTable.id))
        .where(eq(recipesTable.userId, userId));

        return res.status(200).json({
            status: "success",
            data: {
                total_recipes: Number(stats?.totalRecipes || 0),
                unique_cuisines: Number(stats?.cuisineCount || 0),
                avg_prep_time: Math.round(Number(stats?.avgPrepTime || 0)),
                avg_calories: Math.round(Number(stats?.avgCalories || 0))
            }
        });
    } catch (error) {
        return res.status(500).json({ error: `internal server error ${error}` });
    }
});

export default recipeRouter;