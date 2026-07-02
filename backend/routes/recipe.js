import express from 'express';
import { authentication } from '../middleware/auth.js';
import db from '../src/index.js';
import { recipeNutritionTable, recipesTable } from '../models/user.model.js';
import { and, eq } from 'drizzle-orm';

const recipeRouter = express.Router();

recipeRouter.post('/create', authentication, async(req,res) => {

    try {
        
    const userId = req.user.id;

    const {name, description, cuisine, difficulty, prepTime, servings, instructions, 
            nutrition }// expecting : {calories, protein, carbs, fats, fibers}
             = req.body;
    
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
            prepTime : prepTime? Number(prepTime) : null,
            servings : servings? Number(servings) : null,
            instructions,
        }).returning();

        //Insert Nutrition Row if data is provided

        let insertedNutrition = null

        // Object.keys() turns the object properties (like calories or protein) into a flat array (e.g., ['calories', 'protein'])
        if(nutrition && Object.keys(nutrition).length>0){
            [insertedNutrition] = await tx.insert(recipeNutritionTable).values({
                recipeId : newRecipe.id,
                calories : nutrition.calories ? Number(nutrition.calories) : null,
                protein: nutrition.protein ? Number(nutrition.protein) : null,
                carbs: nutrition.carbs ? Number(nutrition.carbs) : null,
                fats: nutrition.fats ? Number(nutrition.fats) : null,
                fiber: nutrition.fiber ? Number(nutrition.fiber) : null,
            }).returning();
        }

        return {
                ...newRecipe,
                nutrition: insertedNutrition
            };


    })
    
    return res.status(201).json({
            status: "success",
            message: "Recipe with nutritional card created successfully!",
            data: recipeResult
        });

    } catch (error) {
        return res.status(500).json({error : "internal server"})
    }
    
})

recipeRouter.get("/", authentication, async(req,res) => {

    try {
        
        const userId = req.user.id;

        const {search, cuisine, difficulty, max_prep_time, 
            max_calories, min_protein, max_fats, // NEW NUTRITION FILTER ARGUMENTS
            sort_by, sort_order, limit, offset } = req.body;

        const [condition] = [eq(recipesTable.userId, userId)];

        if (search) {
            conditions.push(ilike(pantryItemsTable.name, `%${search}%`));
        }

        if(cuisine){
            condition.push(eq(recipesTable.cuisine,cuisine))
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


        //pagination
        const queryLimit = limit ? Number(limit) : 20;
        const queryOffset = offset ? Number(offset) : 0;

        // Custom sorting
        const validSortColumns = { prep_time: recipesTable.prepTime, name: recipesTable.name };
        const sortColumn = validSortColumns[sort_by] || recipesTable.createdAt;
        const finalOrder = sort_order === 'asc' ? sortColumn : desc(sortColumn);

        //we dont put result as an array cuz we dont want 1 result we want all the search items 
        const result = await db.select({
            recipe : recipesTable,
            nutrition : recipeNutritionTable,
        }).where(and(...condition)).orderBy(finalOrder)
            .limit(queryLimit)
            .offset(queryOffset);
        
         // Map results back into a clean nested object structure for the frontend
        const formattedResults = results.map(row => ({
            ...row.recipe,
            nutrition: row.nutrition // Nested directly inside each recipe object!
        }));

        return res.status(200).json({
            status: "success",
            count: formattedResults.length,
            data: formattedResults
        });

    } catch (error) {
        return res.status(500).json({error : "internal server error"})
    }

})

export default recipeRouter;