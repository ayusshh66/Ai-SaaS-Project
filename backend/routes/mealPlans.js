import express from 'express';
import { authentication } from '../middleware/auth.js';
import { createMealPlanSchema, idParamSchema } from '../validators/signupValidation.js';
import db from '../src/index.js';
import { mealPlansTable, recipesTable } from '../models/user.model.js';
import {eq, lte,and, or, gte, asc, desc} from "drizzle-orm"

const mealPlanRouter = express.Router;

mealPlanRouter.post("/create", authentication, async(req,res) => {

    try {
        
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

    } catch (error) {
        return res.status(500).json({error : "Internal server error", error})
    }

})

mealPlanRouter.get('/weekly',authentication, async(req,res) => {

    try {
        
        const userId = req.user.id;

    const {weekStartDate} = req.query;

    if(!weekStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
        return res.status(400).json({ error: "A valid weekStartDate parameter is required in YYYY-MM-DD format." });
    };
    
    // Calculate the end date (6 days in the future to map a complete 7-day week)
    const startDateObj = new Date(weekStartDate);
    const endDateObj = new Date(weekStartDate);
        endDateObj.setDate(endDateObj.getDate() + 6);

    const formattedStartDate = startDateObj.toISOString().split('T')[0];
    const formattedEndDate = endDateObj.toISOString().split('T')[0];

    // Custom order template mapping 'breakfast' to 1, 'lunch' to 2, 'dinner' to 3 
    // so PostgreSQL returns slots chronologically inside each calendar date block.
    const mealTypeOrder = sql`
         CASE ${mealPlansTable.mealType}
            WHEN 'breakfast' THEN 1
            WHEN 'lunch' THEN 2
            WHEN 'dinner' THEN 3
            ELSE 4
         END
    `;

    const weeklyMeals = await db
            .select({
                id: mealPlansTable.id,
                userId: mealPlansTable.userId,
                recipeId: mealPlansTable.recipeId,
                mealDate: mealPlansTable.mealDate,
                mealType: mealPlansTable.mealType,
                recipeName: recipesTable.name,
                recipeDescription: recipesTable.description,
                prepTime: recipesTable.prepTime
            })
            .from(mealPlansTable)
            .innerJoin(recipesTable, eq(mealPlansTable.recipeId, recipesTable.id))
            .where(
                and(
                    //gte stands for Greater Than or Equal To ($\ge$).
                    //lte stands for Less Than or Equal To ($\le$).
                    eq(mealPlansTable.userId, userId),
                    gte(mealPlansTable.mealDate, formattedStartDate),
                    lte(mealPlansTable.mealDate, formattedEndDate)
                )
            )
            .orderBy(
                asc(mealPlansTable.mealDate),
                asc(mealTypeOrder) 
            );

    return res.status(200).json({
        status: "success",
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        count: weeklyMeals.length,
        data: weeklyMeals
    });

    } catch (error) {
        return res.status(500).json({error : "Intern server error", error})
    }    

})

mealPlanRouter.get('/upcoming', authentication, async(req,res) => {

    try {

        const userId = req.user.id;

        const limitParam = req.query.limit ? Number(req.query.limit) : 5;

        const mealTypeOrder = sql`
            CASE ${mealPlansTable.mealType}
                WHEN 'breakfast' THEN 1
                WHEN 'lunch' THEN 2
                WHEN 'dinner' THEN 3
                ELSE 4
            END
        `;

        const upcomingMeals = await db
            .select({
                id: mealPlansTable.id,
                userId: mealPlansTable.userId,
                recipeId: mealPlansTable.recipeId,
                mealDate: mealPlansTable.mealDate,
                mealType: mealPlansTable.mealType,
                recipeName: recipesTable.name,
                prepTime: recipesTable.prepTime
            })
            .from(mealPlansTable)
            .innerJoin(recipesTable, eq(mealPlansTable.recipeId, recipesTable.id))
            .where(
                and(
                    eq(mealPlansTable.userId, userId),
                    gte(mealPlansTable.mealDate, sql`CURRENT_DATE`) // Only pull meals starting today
                )
            )
            .orderBy(
                asc(mealPlansTable.mealDate),
                asc(mealTypeOrder)
            )
            .limit(limitParam);

            return res.status(200).json({
            status: "success",
            count: upcomingMeals.length,
            data: upcomingMeals
        });
        
    } catch (error) {
        return res.status(500).json({error : "Internal server error", error})
    }

})

mealPlanRouter.delete('/delete:id', authentication, async(req,res) =>{
    
    try {
        
        const userId = req.user.id;

        const request = await idParamSchema.safeParseAsync(req.params);

        if(request.error){
            return res.status(400).json({error : request.error.format()})
        }

        const mealPlanId = request.data;

        const [deletedMeal] = await db.delete(mealPlansTable).where(and(eq(mealPlansTable.userId, userId) , eq(mealPlansTable.id, mealPlanId))).returning()

        if (!deletedMeal) {
            return res.status(404).json({ error: "Meal plan entry not found or unauthorized" });
        }

        return res.status(200).json({
            status: "success",
            message: "Meal plan entry was successfully removed",
            deleted_entry: deletedMeal
        });

    } catch (error) {
        return res.status(500).json({error : "Internal Server Error"})
    }

})

export default mealPlanRouter;
