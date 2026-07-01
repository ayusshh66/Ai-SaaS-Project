import express from 'express';
import { authentication } from '../middleware/auth.js';
import db from '../src/index.js';
import { recipeNutritionTable, recipesTable } from '../models/user.model.js';

const recipeRouter = express.Router();

recipeRouter.post('/create', authentication, async(req,res) => {

    try {
        
        const userId = req.user.id;

    const {name, description, cuisine, difficulty, prepTime, servings, instructions, 
            nutrition }// expecting : {calories, protein, carbs, fats, fibers}}
             = req.body;
    
    if(!name || !instructions ){
        return res.status(400).json({error : `name and instruction both are required`})
    }

    // Transaction guarantees that both the recipe and its nutrition row 
    // are saved securely. If one step fails, everything rolls back automatically

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
        return res.status(500).json({error : "internal server error"})
    }
    
})

export default recipeRouter;