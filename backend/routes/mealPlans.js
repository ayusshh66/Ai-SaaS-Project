import express from 'express';
import { authentication } from '../middleware/auth.js';
import { createMealPlanSchema } from '../validators/signupValidation.js';
import db from '../src/index.js';
import { mealPlansTable } from '../models/user.model.js';

const mealPlanRouter = express.Router;

mealPlanRouter.post("/create", authentication, async(req,res) => {

    const userId = req.user.id;

    const request = await createMealPlanSchema.safeParseAsync(req.body); // no need to wrap it into an object;

    if(request.error){
        return res.status(400).json({error : request.error.format()})
    }

    const {recipeId, mealDate, mealType} = request.data;

    const [upsertedMeal] = await db.insert(mealPlansTable).values({
        userId,
        recipeId,
        mealType,
        mealDate,
    }).onConflictDoUpdate({
        target : [mealPlansTable.userId, mealPlansTable.mealDate, mealPlansTable.mealType],
        set : {
            recipeId : recipeId,
            updatedAt : new Date(),
        }
    }).returning();

    return res.status(201).json({
        status: "success",
        message: "Meal plan slot scheduled successfully",
        data: upsertedMeal
    });

})

export default mealPlanRouter;
