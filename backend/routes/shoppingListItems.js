import express from 'express';
import { authentication } from '../middleware/auth.js';
import { createItemSchema, generateListSchema, idParamSchema, updateItemSchema } from '../validators/signupValidation.js';
import db from '../src/index.js';
import { mealPlansTable, pantryItemsTable, recipeIngredientsTable, shoppingListItemsTable } from '../models/user.model.js';
import { asc } from 'drizzle-orm';

const shoppingListRouter = express.Router();

shoppingListRouter.post('/generate', authentication, async(req,res) => {

    try {
        
        const userId = req.user.id;

        const validation = await generateListSchema.safeParseAsync(req.body);

        if(validation.error){
            return res.status(500).json({error : validation.error.format()})
        }

        const { startDate, endDate } = validation.data;

        const resultList = await db.transaction(async(tx) => {

            //clears previous auto generated list
            await tx.delete(shoppingListItemsTable).where(and(eq(shoppingListItemsTable.userId, userId) , eq(shoppingListItemsTable, true)))

            const recipeIngredients = await tx.select({
                ingredients : recipeIngredientsTable.ingredients,
                unit : recipeIngredientsTable.unit,
                totalQuantity: sql`SUM(${recipeIngredientsTable.quantity})`.mapWith(Number),
            }).from(mealPlansTable).where(and(
                        eq(mealPlansTable.userId, userId),
                        gte(mealPlansTable.mealDate, startDate),
                        lte(mealPlansTable.mealDate, endDate))).groupBy(recipeIngredientsTable.name, recipeIngredientsTable.unit);

            const pantryItems = await tx.select({
                name : pantryItemsTable.name,
                unit : pantryItemsTable.unit,
                quantity : pantryItemsTable.quantity
            }).from(pantryItemsTable).where(eq(pantryItemsTable.userId, userId))

            //Map pantry items to an O(1) hash map for ultra-fast checks
            const pantryMap = new Map();
            pantryItems.forEach((item) => {
                const key = `${item.name.toLowerCase()}_${item.unit}`;
                pantryMap.set(key, Number(item.quantity || 0));
            });

            //Loop over needed ingredients, subtract what is in stock, and prepare bulk insert
            const itemsToInsert = [];
            for (const ing of recipeIngredients) {
                const key = `${ing.ingredientName.toLowerCase()}_${ing.unit}`;
                const pantryQty = pantryMap.get(key) || 0;
                const neededQty = Math.max(0, Number(ing.totalQuantity) - pantryQty);

                if (neededQty > 0) {
                    itemsToInsert.push({
                        userId,
                        ingredientName: ing.ingredientName,
                        quantity: String(neededQty),
                        unit: ing.unit,
                        fromMealPlan: true,
                        category: "Uncategorized"
                    });
                }
            }

            if (itemsToInsert.length > 0) {
                await tx.insert(shoppingListItemsTable).values(itemsToInsert);
            }

            return await tx
                .select()
                .from(shoppingListItemsTable)
                .where(eq(shoppingListItemsTable.userId, userId))
                .orderBy(
                    asc(shoppingListItemsTable.category),
                    asc(shoppingListItemsTable.ingredientName)
                );

        })

        return res.status(200).json({
            status: "success",
            message: "Smart shopping list generated successfully",
            count: resultList.length,
            data: resultList
        });

    } catch (error) {
        return res.status(400).json({error : `Internal Server Error`})
    }

})

shoppingListRouter.post('/create', authentication, async(req,res) => {

    try {
        
        const userId = req.user.id;

        const validation = await createItemSchema.safeParseAsync(req.body);

        if(validation.error){
            return res.status(400).json({error : validation.error.format()})
        }

        const {ingredient_name, quantity, unit, category} = validation.data;

        const [shoppingListItems] = await db.insert(shoppingListItemsTable).values({
                userId,
                ingredientName: ingredient_name,
                quantity,
                unit,
                category: category || "Uncategorized",
                fromMealPlan: false
        }).returning();

        return res.status(201).json({
            status: "success",
            message: "Shopping list item created successfully",
            data: newItem
        });

    } catch (error) {
        return res.status(400).json({error : "Internal Server Error"})
    }

})

shoppingListRouter.get("/", authentication, async (req, res) => {
    try {
        const userId = req.user.id;

        const items = await db
            .select()
            .from(shoppingListItemsTable)
            .where(eq(shoppingListItemsTable.userId, userId))
            .orderBy(
                asc(shoppingListItemsTable.category),
                asc(shoppingListItemsTable.ingredientName)
            );

        return res.status(200).json({
            status: "success",
            count: items.length,
            data: items
        });

    } catch (error) {
        console.error("Error fetching shopping list:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

shoppingListRouter.delete('/delete/:id', authentication, async(req,res) => {

    try {
        
        const userId = req.user.id;

        const validation = await idParamSchema.safeParseAsync(req.params);

        if(validation.error){
            return res.status(500).json({error : validation.error.format()})
        }

        const itemId = validation.data;

        const [deleteItem]= await db.delete(shoppingListItemsTable).where(and(eq(shoppingListItemsTable.userId, userId), eq(shoppingListItemsTable.id, itemId))).returning()

        if(!deleteItem){
            return res.status(400).json({error : "there is no item with the id given"})
        }
        return res.status(200).json({
            status : "succes",
            message : "deleted succesfully",
            delete_items : deleteItem
        })

    } catch (error) {
        return res.status(400).json({error : "Internal Server Error"})
    }
})

shoppingListRouter.patch("/update/:id", authentication, async(req,res) => {

    try {
        
    const userId = req.user.id;

    const request = await idParamSchema.safeParseAsync(req.params);

    if(request.error){
        return res.status(400).json({error : request.error.format()})
    }

    const itemId = request.data;

    const validation = await updateItemSchema.safeParseAsync(req.body);

    if(validation.error){
        return res.status(400).json({error : validation.error.format()})
    }

    const {ingredient_name, quantity, unit, category, is_checked} = validation.data;

    const [updateItem] = await db.update(shoppingListItemsTable).set({
        ingredientName : ingredient_name,
        unit,
        quantity,
        category,
        isChecked : is_checked,
        updatedAt : new Date(),
    }).where(and(eq(shoppingListItemsTable.id, itemId), eq(shoppingListItemsTable.userId, userId))).returning()

    return res.status(200).json({
        status : "success",
        message : "updated successfully",
        updated_items : updateItem,
    })

    } catch (error) {
        return res.status(500).json({error : "Inernal Server Error"})
    }

})

shoppingListRouter.get('/grouped', authentication, async(req,res) => {

    try {
        
        const userId = req.user.id;

        //[
//   { "name": "Apple", "category": "Produce" },
//   { "name": "Milk", "category": "Dairy" },
//   { "name": "Tomato", "category": "Produce" },
//   { "name": "Cheese", "category": "Dairy" }
// ]
        const flatItems = await db.select().from(shoppingListItemsTable).where(eq(shoppingListItemsTable.userId, userId)).orderBy(asc(shoppingListItemsTable.category))

        const groupedObject = {};

        flatItems.forEach((items) => {

            const cat = items.category || "Uncategorized" 

            // If this category doesn't exist in our object yet, create an empty list
            if(!groupedObject[cat]){
                groupedObject[cat] = [];
            }

            // Push the clean item properties into its matching category bucket
            groupedObject[cat].pus({
                id: items.id,
                ingredient_name: items.ingredientName,
                quantity: items.quantity,
                unit: items.unit,
                is_checked: items.isChecked,
                from_meal_plan: items.fromMealPlan
            })
        })

        const formattedResult = Object.keys(groupedObject).map((categoryName) => ({
            category : categoryName,
            items : groupedObject[categoryName]
        }))

        return res.status(200).json({
            status: "success",
            count: formattedResult.length,
            data: formattedResult
        });

    } catch (error) {
        return res.status(400).json({
            error : "Internal Server Error"
        })
    }

})

export default shoppingListRouter;