import express from 'express';
import { authentication } from '../middleware/auth.js';
import db from '../src/index.js';
import { recipeNutritionTable, recipesTable, recipeIngredientsTable } from '../models/user.model.js';
import { and, eq, ilike, desc } from 'drizzle-orm';
import { idPantryValidation,createMealPlanSchema, createRecipeSchema } from '../validators/signupValidation.js';

const recipeRouter = express.Router();

recipeRouter.post('/create', authentication, async(req,res) => {

    try {
        
    const userId = req.user.id;

    const validation = await createRecipeSchema.safeParseAsync(req.body)

    // const {name, description, cuisine, difficulty, prepTime, servings, instructions, 
    //         nutrition }// expecting : {calories, protein, carbs, fats, fibers}
    //          = req.body;

    const {
            name,
            description,
            cuisine,
            difficulty,
            prepTime,
            servings,
            instructions,
            nutrition,
            ingredients
        } = validation.data;

    if(!name || !instructions ){
        return res.status(400).json({error : `name and instruction both are required`})
    }

    // Transaction guarantees that both the recipe and its nutrition row 
    // are saved securely. If one step fails, everything rolls back automatically

    // We use transactions here because the API route is explicitly designed to
    //  handle a two-table relational chain (Recipe + Nutrition Card) in a single request.

    //the major difference ..... below
    //When you create a pantry item, it is a standalone endpoint.
    //When you create a recipe, you have the option to also create a record in a completely different table: the recipe_nutrition table.

    const recipeResult = await db.transaction(async(tx) => {

        const [newRecipe] = await tx.insert(recipesTable).values({
            userId,
            name,
            description,
            cuisine,
            difficulty,
            prepTime : prepTime? prepTime : null,
            servings : servings? servings : null,
            instructions, // jsonb natively stores our steps array
        }).returning();

        //Insert Nutrition Row if data is provided

        let insertedNutrition = null

        // Object.keys() turns the object properties (like calories or protein) into a flat array (e.g., ['calories', 'protein'])
        if(nutrition && Object.keys(nutrition).length>0){
            [insertedNutrition] = await tx.insert(recipeNutritionTable).values({
                recipeId : newRecipe.id,
                calories : nutrition.calories ? nutrition.calories : null,
                protein: nutrition.protein ? nutrition.protein : null,
                carbs: nutrition.carbs ? nutrition.carbs : null,
                fats: nutrition.fats ? nutrition.fats : null,
                fiber: nutrition.fiber ? nutrition.fiber : null,
            }).returning();
        }

        let insertedIngredient = []; // this is not null cuz its not optional, its mendatory so we kept it as arrays

        if(ingredients && ingredients.length > 0){

           const formattedIngredients = ingredients.map(ing => ({
                    recipeId: newRecipe.id,
                    name: ing.name,
                    quantity: String(ing.quantity), // Pg numeric handles decimals accurately when passed as string
                    unit: ing.unit
                })); 
            // it is already an array thats why we did not put it in an array brackets
            insertedIngredient = await tx.insert(recipeIngredientsTable).values(formattedIngredients).returning();
        }

        return {
                ...newRecipe,
                nutrition: insertedNutrition,
                ingredients: insertedIngredient
            };


    })
    
    return res.status(201).json({
            status: "success",
            message: "Recipe created successfully!",
            data: recipeResult
        });

    } catch (error) {
        return res.status(500).json({error : "internal server"})
    }
    
})

recipeRouter.get("/", authentication, async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            search, 
            cuisine, 
            difficulty, 
            max_prep_time, 
            max_calories, 
            min_protein, 
            max_fats, 
            sort_by, 
            sort_order, 
            limit, 
            offset 
        } = req.query;

        const conditions = [eq(recipesTable.userId, userId)];

        if (search) {
            conditions.push(ilike(recipesTable.name, `%${search}%`));
        }

        if (cuisine) {
            conditions.push(eq(recipesTable.cuisine, cuisine));
        }
        
        if (difficulty) {
            conditions.push(eq(recipesTable.difficulty, difficulty));
        }

        if (max_prep_time) {
            conditions.push(lte(recipesTable.prepTime, Number(max_prep_time)));
        }

        if (max_calories) {
            conditions.push(lte(recipeNutritionTable.calories, Number(max_calories)));
        }

        if (min_protein) {
            conditions.push(gte(recipeNutritionTable.protein, Number(min_protein)));
        }

        if (max_fats) {
            conditions.push(lte(recipeNutritionTable.fats, Number(max_fats)));
        }

        // Pagination
        const queryLimit = limit ? Number(limit) : 20;
        const queryOffset = offset ? Number(offset) : 0;

        // Custom sorting
        const validSortColumns = { prep_time: recipesTable.prepTime, name: recipesTable.name };
        const sortColumn = validSortColumns[sort_by] || recipesTable.createdAt;
        const finalOrder = sort_order === 'asc' ? sortColumn : desc(sortColumn);

        // Fetch using Drizzle Relational API
        const results = await db.query.recipesTable.findMany({
            where: and(...conditions), // Spread operations work cleanly now!
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

recipeRouter.patch('/update/:id', authentication, async(req,res) =>{

    try {
        
        const userId = req.user.id

        const request = await idPantryValidation.safeParseAsync(req.params.id);

        if(request.error){
            res.status(500).json({error : request.error.format})
        }

        const {recipeId} = request.data;

        // name cuisin etc will be stored inside recipeUpdate and nutrition such as calories etc will be there in nutrition
        const {nutrition,ingredients,  ...recipeUpdates} = req.body;

        const updatedResult = await db.transaction(async(tx) => {

            //updating parent recipe
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

        }  )

        if (!updatedResult) {
            return res.status(404).json({ error: "Recipe not found or unauthorized" });
        }

        return res.status(200).json({
            status: "success",
            message: "Recipe and nutrition card updated successfully",
            data: updatedResult
        });


    } catch (error) {
        res.status(400).json({error : `Internal Server Error ${error}`})
    }

})

recipeRouter.delete('/delete/:id', authentication, async(req,res) => {

    try { 
        
        const userId = req.user.id;

        const request = await idPantryValidation.safeParseAsync(req.params.id);

        if(request.error){
            res.status(500).json({error : request.error.format()})
        }

        const {id} = request.data;

        const [deleteRecipe] = await db.delete(recipesTable).where(and(eq(recipesTable.id, id , eq(recipesTable.userId, userId)))).returning();
        
        if(!deleteRecipe){
            return res.status(400).json({error : `there is no recipe`})
        }

        return res.status(200).json({status : "successful!", data : {deleteRecipe}})




    } catch (error) {
        res.status(400).json({error : `internal server error ${error}`})
    }

})

recipeRouter.get("/stats", authentication, async(req,res) => {

    const userId = req.user.id;

    const [ stats] = await db.select({
        totalRecipes: count(recipesTable.id),
        cuisineCount: countDistinct(recipesTable.cuisine),
        avgPrepTime: avg(recipesTable.prepTime),
        avgCalories: avg(recipeNutritionTable.calories)
    }).from(recipesTable).leftJoin(recipeNutritionTable, eq(recipeNutritionTable.id, recipeNutritionTable.userId))
    .where(eq(recipesTable.id, userId))

    return res.status(200).json({
        status: "success",
        data: {
            total_recipes: Number(stats.totalRecipes || 0),
            unique_cuisines: Number(stats.cuisineCount || 0),
            avg_prep_time: Math.round(Number(stats.avgPrepTime || 0)),
            avg_calories: Math.round(Number(stats.avgCalories || 0))
            }
        });
})

export default recipeRouter;