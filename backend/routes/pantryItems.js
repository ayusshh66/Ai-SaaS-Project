import express from 'express'
import { usersTable, pantryItemsTable, recipeIngredientsTable } from '../models/user.model.js'
import { idPantryValidation, pantryItemValidation, pantryQuerySchema } from '../validators/signupValidation.js';
import db from '../src/index.js';
import { authentication } from '../middleware/auth.js';
import { desc, eq, ilike, and, or, sql, gte, lte, asc } from 'drizzle-orm';


const pantryRouter = express.Router();

pantryRouter.post('/create', authentication,async(req,res) => {
    try {
        const request = await  pantryItemValidation.safeParseAsync(req.body);

        if(request.error){
            return res.status(400).json({error : request.error.format()})
        }

        const {name, quantity, unit , category, expirey_date, is_running_low = false } = request.data;
        
        const relatedId = req.user.id;
        const userName = req.user.name;

        const [pantryItems] = await db.insert(pantryItemsTable).values({
            userId :relatedId,
            name,
            quantity,
            unit,
            category,
            expiryDate : expirey_date,
            isRunningLow : is_running_low,
        }).returning();

        return res.status(200).json({status : `new pantry items has been created`, data : pantryItems, name : userName,})
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Internal server error" })
    }
})

pantryRouter.delete("/delete/:id", authentication, async(req,res) => {

    try {

        const relatedId = req.user.id;
        const userName = req.user.name;
        const request = await idPantryValidation.safeParseAsync({id : req.params.id});

        // const itemId = request.data;

        if(request.error){
            return res.status(400).json({error : request.error.format()})
        }

        const itemId = request.data.id;

        const [deleteItems] = await db.delete(pantryItemsTable).where(and(eq(pantryItemsTable.id, itemId), eq(pantryItemsTable.userId, relatedId))).returning()

        if(!deleteItems){
            return res.status(400).json({error : `pantry item not found`})
        }

        return res.status(400).json({status : `pantry item of ${userName} has been deleted`, deleted_items : deleteItems})
    } catch (error) {
        console.error(error);
        return res.status(400).json({error : `error ${error}`})
    }


})

pantryRouter.patch("/update/:id", authentication, async(req,res) => {
    try {
        
    const userName = req.user.name;
    const relatedId = req.user.id
    const request = await idPantryValidation.safeParseAsync({id : req.params.id});

    if(request.error){
        return res.status(400).json({error : request.error.format()})
    }

    const itemId = request.data.id;

    const update = await pantryItemValidation.safeParseAsync(req.body);

    if(update.error){
        return res.status(400).json({error : update.error.format()})
    }

    const {name, quantity, unit , category, expirey_date, is_running_low = false } = update.data;


    const [data] = await db.select({
        name : pantryItemsTable.name ,
        quantity : pantryItemsTable.quantity,
        unit : pantryItemsTable.unit,
        category : pantryItemsTable.category,
        expiryDate : pantryItemsTable.expiryDate,
        isRunningLow : pantryItemsTable.isRunningLow,
    }).from(pantryItemsTable).where(and(eq(pantryItemsTable.id, itemId), eq(pantryItemsTable.userId, relatedId)))

    if(!data){
        return res.status(400).json({error : `no pantry item found`})
    }

    const [updatedItem] = await db.update(pantryItemsTable).set({name, quantity, unit, category, expiryDate : expirey_date, isRunningLow: is_running_low})
    .where(and(eq(pantryItemsTable.id, itemId), eq(pantryItemsTable.userId, relatedId))).returning()

    return res.status(200).json({status : `updated successfully`, previous_item : data, updated_item : updatedItem})

    } catch (error) {
        console.error(error);
        return res.status(500).json({error : "internal server error"})
    }
})

pantryRouter.get('/', authentication, async(req,res) => {

    try {
        
        const userId = req.user.id;

        const userPantry = await db.select().from(pantryItemsTable).where(eq(pantryItemsTable.userId, userId));

        return res.status(200).json({ data : userPantry})

    } catch (error) {
        return res.status(400).json({error : "Internal Server Error", error})
    }

})

pantryRouter.get('/expiring-soon', authentication, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const daysAhead = parseInt(req.query.day) || 7;

        const today = new Date().toISOString().split('T')[0];

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);
        const targetDateStr = futureDate.toISOString().split('T')[0];

        const expiringItems = await db.query.pantryItemsTable.findMany({
            where: and(
                eq(pantryItemsTable.userId, userId),
                gte(pantryItemsTable.expiryDate, today),         // Expiry date is today or later
                lte(pantryItemsTable.expiryDate, targetDateStr)  // Expiry date is within our window
            ),
            orderBy: asc(pantryItemsTable.expiryDate)            // Soonest items first
        });

        return res.status(200).json({
            status: "success",
            data: {
                items: expiringItems
            }
        });

    } catch (error) {
        console.error("Error fetching expiring pantry items:", error);
        return res.status(500).json({
            status: "error",
            error: "Internal server error fetching expiring items"
        });
    }
});

pantryRouter.get("/stats", authentication, async (req, res) => {
    try {
        const query = await pantryQuerySchema.safeParseAsync(req.query);

        if (query.error) {
            return res.status(400).json({ error: query.error.format() });
        }

        const { category, search, isRunningLow, page, limit } = query.data;

        const filter = [
            eq(pantryItemsTable.userId, req.user.id)
        ];

        if (category) {
            filter.push(eq(pantryItemsTable.category, category));
        }

        if (search) {
            filter.push(ilike(pantryItemsTable.name, `%${search}%`));
        }

        if (typeof isRunningLow === "boolean") {
            filter.push(eq(pantryItemsTable.isRunningLow, isRunningLow));
        }

        const pantryItems = await db
            .select()
            .from(pantryItemsTable)
            .where(and(...filter)) 
            .orderBy(desc(pantryItemsTable.createdAt))
            .limit(limit)
            .offset((page - 1) * limit);
        
        // Fetch matching context from recipeIngredientsTable to help map tracking logs
        const linkedIngredients = await db
            .select({
                name: recipeIngredientsTable.name,
                unit: recipeIngredientsTable.unit,
                useCount: sql`count(${recipeIngredientsTable.id})`.mapWith(Number)
            })
            .from(recipeIngredientsTable)
            .groupBy(recipeIngredientsTable.name, recipeIngredientsTable.unit);

        return res.status(200).json({
            success: true,
            results: pantryItems.length,
            page,   
            limit,
            data: pantryItems,
            recipe_ingredient_metrics: linkedIngredients
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'internal server error' });
    }
});

export default pantryRouter;